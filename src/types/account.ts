export interface Customer {
  customer_id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  cellphone?: string
  legal_name?: string
  active: number
  registration_date: string
}

export interface SignInCredentials {
  email: string
  password: string
}

export interface SignUpCredentials {
  first_name: string
  last_name: string
  email: string
  password?: string
  phone?: string
  cellphone?: string
  legal_name?: string
}
