<#
.SYNOPSIS
    Auditor v7.3 ULTRA — Fortress v7.24
.DESCRIPTION
    Varre o diretório de documentação do Fortress e aplica uma bateria de checagens para garantir conformidade com Master Index e padrões v7.24.
.PARAMETER Path
    Diretório raiz do FORTRESS_DOCS_V7.
.PARAMETER ReportOut
    Caminho do arquivo JSON de saída com o relatório.
.PARAMETER StagedFiles
    (Opcional) Lista de arquivos para validar em modo "staged".
.EXAMPLE
    .\auditor_v7_3_ultra.ps1 -Path "./FORTRESS_DOCS_V7" -ReportOut "./auditor_report.json"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Path,

    [string]$ReportOut = "./auditor_report.json",

    [string[]]$StagedFiles
)

# Helper functions
function Write-Log {
    param([string]$Message, [string]$Level="INFO")
    $time = (Get-Date).ToString("s")
    Write-Output "[$time] [$Level] $Message"
}

function Get-MdFiles {
    param([string]$base)
    return Get-ChildItem -Path $base -Recurse -File -Include *.md -ErrorAction SilentlyContinue
}

function Check-MasterIndex {
    param([string]$base)
    $file = Join-Path $base "master_index_v_7.md"
    return Test-Path $file
}

function Check-Structure {
    param([string]$base)
    $expected = @("foundation","method","architecture","PFS","api","ops","runbooks","security","product","glossary")
    $exists = @{}
    foreach($p in $expected){
        $exists[$p] = Test-Path (Join-Path $base $p)
    }
    return $exists
}

function Check-Naming {
    param([System.IO.FileInfo[]]$files)
    $violations = @()
    foreach($f in $files){
        $name = $f.Name
        if($name -notmatch "_v_7" -and $name -notmatch "_v7"){
            $violations += @{ file = $f.FullName; reason = "missing version suffix _v_7 or _v7" }
        }
        if($name -match "\s"){
            $violations += @{ file = $f.FullName; reason = "contains spaces" }
        }
        if($name -match "[A-Z]"){
            $violations += @{ file = $f.FullName; reason = "contains uppercase letters; must be snake_case" }
        }
    }
    return $violations
}

function Check-SmallFiles {
    param([System.IO.FileInfo[]]$files, [int]$minBytes=2048)
    $small = @()
    foreach($f in $files){
        if($f.Length -lt $minBytes){
            $small += @{ file = $f.FullName; size = $f.Length }
        }
    }
    return $small
}

function Check-Duplicates {
    param([System.IO.FileInfo[]]$files)
    $hashes = @{}
    $dups = @()
    foreach($f in $files){
        try{
            $content = Get-Content -Path $f.FullName -Raw -ErrorAction Stop
            $h = (Get-FileHash -Algorithm SHA256 -InputStream ([System.IO.MemoryStream]::new([System.Text.Encoding]::UTF8.GetBytes($content)))) | Select-Object -ExpandProperty Hash
            if($hashes.ContainsKey($h)){
                $dups += @{ file = $f.FullName; duplicateOf = $hashes[$h] }
            } else {
                $hashes[$h] = $f.FullName
            }
        } catch {
            # ignore read errors
        }
    }
    return $dups
}

function Check-ILIDs {
    param([System.IO.FileInfo[]]$files, [string]$masterIndexPath)
    $ilidRefs = @()
    $masterContent = ""
    if(Test-Path $masterIndexPath){
        $masterContent = Get-Content -Path $masterIndexPath -Raw -ErrorAction SilentlyContinue
    }
    foreach($f in $files){
        $content = Get-Content -Path $f.FullName -Raw -ErrorAction SilentlyContinue
        if($content -match "pfs\." -or $content -match "arch\." -or $content -match "api\." ){
            # extract tokens like pfs.kernel.v7 etc.
            $matches = [regex]::Matches($content, "\b(pfs|arch|api|security|obs|runbook)\.[a-z0-9_\.]+")
            foreach($m in $matches){ $ilidRefs += $m.Value }
        }
    }
    # Check if referenced ILIDs exist in master index
    $missing = @()
    foreach($il in $ilidRefs | Sort-Object -Unique){
        if($masterContent -notmatch [regex]::Escape($il)){
            $missing += $il
        }
    }
    return $missing
}

# MAIN
$report = @{
    timestamp = (Get-Date).ToString("s")
    path = (Resolve-Path $Path).Path
    checks = @{}
}

if(-not (Test-Path $Path)){
    Write-Error "Path not found: $Path"
    exit 2
}

Write-Log "Starting Auditor v7.3 ULTRA on $Path"

# Collect files
$mdFiles = Get-MdFiles -base $Path
$mdList = $mdFiles | ForEach-Object { $_ }

# Check Master Index
$hasMaster = Check-MasterIndex -base $Path
$report.checks.master_index = @{ ok = $hasMaster; message = if($hasMaster) { "found" } else { "missing" } }

# Check structure
$structure = Check-Structure -base $Path
$report.checks.structure = $structure

# Naming violations
$naming = Check-Naming -files $mdList
$report.checks.naming_violations = $naming

# Small files
$small = Check-SmallFiles -files $mdList -minBytes 2048
$report.checks.small_files = $small

# Duplicates
$dups = Check-Duplicates -files $mdList
$report.checks.duplicates = $dups

# ILIDs
$masterIndexPath = Join-Path $Path "master_index_v_7.md"
$missingILIDs = Check-ILIDs -files $mdList -masterIndexPath $masterIndexPath
$report.checks.missing_ilids_in_master_index = $missingILIDs

# Simple heuristics: look for 'event' tokens in PFS without corresponding event catalog file
$eventCatalogPath = Join-Path $Path "architecture\event_catalog_v_7.md"
$eventIssues = @()
if(Test-Path $eventCatalogPath){
    $eventCatalogContent = Get-Content -Path $eventCatalogPath -Raw -ErrorAction SilentlyContinue
} else {
    $eventIssues += "event_catalog_v_7.md missing in architecture/"
}
$report.checks.event_catalog = if(Test-Path $eventCatalogPath){ @{ ok = $true } } else { @{ ok = $false; message = "missing" } }

# Finalize report
$report_json = $report | ConvertTo-Json -Depth 6
Set-Content -Path $ReportOut -Value $report_json -Encoding UTF8

# Also write a small human readable report
$mdOut = Join-Path (Split-Path $ReportOut) "auditor_report.md"
$mdLines = @()
$mdLines += "# Auditor v7.3 ULTRA — Relatório"
$mdLines += ""
$mdLines += "Gerado em: " + $report.timestamp
$mdLines += ""
foreach($k in $report.checks.Keys){
    $mdLines += "## " + $k
    $val = $report.checks[$k]
    $mdLines += '```json'
    $mdLines += ($val | ConvertTo-Json -Depth 6)
    $mdLines += '```'
    $mdLines += ""
}
$mdLines += "----"
$mdLines += "`Exit code 0 = OK, 1 = Violations (HIGH/CRITICAL), 2 = Error`"
$mdLines | Out-File -FilePath $mdOut -Encoding utf8

Write-Log "Auditor finished. Report -> $ReportOut and $(Split-Path $mdOut -Leaf)"

# Decide exit code: if master missing or naming violations exist -> 1
$hasCritical = -not $hasMaster -or ($naming.Count -gt 0) -or ($dups.Count -gt 0)
if($hasCritical){
    Write-Log "Violations detected." "WARN"
    exit 1
}

Write-Log "No critical violations detected." "INFO"
exit 0
