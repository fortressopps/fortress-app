import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/db'
import { getPaginationParams, toSkipTake, getPaginationMetaWithOptions } from '../../../utils/pagination'

// GET - Listar todas as contas do usuário
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Paginação
    const params = getPaginationParams(new URL(request.url).searchParams)
    const { skip, take } = toSkipTake(params.page, params.pageSize)

    const [accounts, totalCount] = await Promise.all([
      prisma.account.findMany({
        where: {
          userId: userId,
          isActive: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.account.count({ where: { userId: userId, isActive: true } })
    ])

    const meta = getPaginationMetaWithOptions(totalCount, params.page, params.pageSize)

    return NextResponse.json({
      success: true,
      data: accounts,
      meta
    })

  } catch (error) {
    console.error('[ACCOUNTS_GET]', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}

// POST - Criar nova conta
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validação básica
    if (!body.name || !body.type) {
      return NextResponse.json(
        { error: 'Nome e tipo são obrigatórios' }, 
        { status: 400 }
      )
    }

    // Criar conta
    const account = await prisma.account.create({
      data: {
        name: body.name,
        type: body.type,
        balance: body.balance || 0,
        currency: body.currency || 'BRL',
        institution: body.institution,
        color: body.color || '#6b7280',
        userId: userId
      }
    })

    return NextResponse.json({
      success: true,
      data: account,
      message: 'Conta criada com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error('[ACCOUNTS_POST]', error)
    return NextResponse.json(
      { error: 'Erro ao criar conta' }, 
      { status: 500 }
    )
  }
}
