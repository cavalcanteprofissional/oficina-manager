export interface CEPResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localizacao: string
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
  erro?: boolean
}

export async function consultarCEP(cep: string): Promise<CEPResponse | null> {
  const cleanCep = cep.replace(/\D/g, '')
  
  if (cleanCep.length !== 8) {
    return null
  }
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      console.error('Erro na requisição CEP:', response.status)
      return null
    }
    
    const data: CEPResponse = await response.json()
    
    if (data.erro) {
      return null
    }
    
    return data
  } catch (error) {
    console.error('Erro ao consultar CEP:', error)
    return null
  }
}

export function formatCEP(cep: string): string {
  const cleanCep = cep.replace(/\D/g, '')
  if (cleanCep.length === 8) {
    return `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}`
  }
  return cep
}
