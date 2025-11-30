<# ====================================================================
   AUDITOR v7 — Definitivo
   Sistema de Auditoria, Integridade e Registro Automático de Mudanças
   ====================================================================
#>

$RootPath = "C:\Users\Robert\OneDrive\Documentos\FORTRESS DOCS"
$SnapshotFile = "$RootPath\audit_snapshot.json"
$ChangeSet = "$RootPath\changeset_v7.md"
$AuditLog = "$RootPath\audit_log.txt"

# -------------------------------
# Função utilitária: Hash SHA256
# -------------------------------
function Get-FileHashEntry {
    param([string]$Path)
    return @{
        Path = $Path
        Hash = (Get-FileHash -Algorithm SHA256 -Path $Path).Hash
        LastWrite = (Get-Item $Path).LastWriteTimeUtc
    }
}

# ----------------------------------------
# Coleta atual de arquivos do diretório
# ----------------------------------------
Write-Host "📌 Capturando arquivos atuais..."
$CurrentFiles = Get-ChildItem -Recurse -File -Path $RootPath | ForEach-Object {
    Get-FileHashEntry $_.FullName
}

# ----------------------------------------
# Carrega snapshot anterior (se existir)
# ----------------------------------------
$PreviousFiles = @{}
if (Test-Path $SnapshotFile) {
    Write-Host "📌 Carregando snapshot anterior..."
    $PreviousFiles = (Get-Content $SnapshotFile | ConvertFrom-Json)
} else {
    Write-Host "⚠ Nenhum snapshot encontrado — criando novo."
}

# ----------------------------------------
# Detecta mudanças
# ----------------------------------------
Write-Host "📌 Detectando mudanças..."
$Added = @()
$Removed = @()
$Modified = @()

# Indexação rápida
$PrevIndex = @{}
foreach ($p in $PreviousFiles) { $PrevIndex[$p.Path] = $p }

$CurrIndex = @{}
foreach ($c in $CurrentFiles) { $CurrIndex[$c.Path] = $c }

# Arquivos novos ou modificados
foreach ($c in $CurrentFiles) {
    if (-not $PrevIndex.ContainsKey($c.Path)) {
        $Added += $c
    } elseif ($c.Hash -ne $PrevIndex[$c.Path].Hash) {
        $Modified += $c
    }
}

# Arquivos removidos
foreach ($p in $PreviousFiles) {
    if (-not $CurrIndex.ContainsKey($p.Path)) {
        $Removed += $p
    }
}

# ----------------------------------------
# Função de diff inteligente
# ----------------------------------------
function Generate-Diff {
    param($OldPath, $NewPath, $OutputPath)

    if (!(Test-Path $OldPath) -or !(Test-Path $NewPath)) { return }

    $ext = [System.IO.Path]::GetExtension($NewPath).ToLower()
    $textExtensions = ".txt", ".md", ".ps1", ".json", ".xml", ".yaml", ".yml"

    if ($textExtensions -contains $ext) {
        $old = Get-Content $OldPath
        $new = Get-Content $NewPath
        Compare-Object $old $new | Out-File $OutputPath
    }
}

# ----------------------------------------
# Atualiza o CHANGSET
# ----------------------------------------
$Time = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$Entry = @"
## 🔹 Registro — $Time

### Arquivos adicionados
$(if ($Added.Count -eq 0) { "- Nenhum" } else { $Added.Path -join "`n" })

### Arquivos removidos
$(if ($Removed.Count -eq 0) { "- Nenhum" } else { $Removed.Path -join "`n" })

### Arquivos modificados
$(if ($Modified.Count -eq 0) { "- Nenhum" } else { $Modified.Path -join "`n" })
"@

Add-Content -Path $ChangeSet -Value $Entry
Add-Content -Path $AuditLog -Value "[ $Time ] Auditor executado."

# ----------------------------------------
# Gera diffs
# ----------------------------------------
foreach ($m in $Modified) {
    $oldTemp = "$RootPath\_old.tmp"
    $newTemp = "$RootPath\_new.tmp"
    $diffOut = "$RootPath\diff_$($m.Path.Replace('\','_')).txt"

    # Se o arquivo existia antes, tenta recuperar conteúdo antigo
    $prev = $PrevIndex[$m.Path]
    if ($prev) {
        # NÃO temos backup do conteúdo antigo → auditor v7 permanece leve
        # Mas podemos no futuro habilitar versioning local
    }

    # Apenas gera diff do snapshot atual com ele mesmo (placeholder)
    # Para habilitar diff real: ativar version store (posso gerar isso)
    Generate-Diff $m.Path $m.Path $diffOut
}

# ----------------------------------------
# Salva snapshot atualizado
# ----------------------------------------
$CurrentFiles | ConvertTo-Json | Out-File $SnapshotFile

Write-Host "✅ Auditor v7 concluído."
