# Estrutura Completa do Projeto SIGEP

Abaixo está a estrutura completa do projeto, mostrando a organização de todos os arquivos e pastas conforme solicitado:

```
lib/
├── utils/
│   ├── paypal.utils.ts
│   ├── product.utils.ts
│   ├── user.utils.ts
│   ├── currency.utils.ts
│   ├── error.utils.ts
│   ├── auth.utils.ts
│   ├── cart.utils.ts
│   ├── price.utils.ts
│   ├── uuid.utils.ts
│   ├── text.utils.ts
│   ├── number.utils.ts
│   ├── date.utils.ts
│   └── convert.utils.ts
│
├── helpers/
│   ├── paypal.helpers.ts
│   ├── cart.helpers.ts
│   └── auth.helpers.ts
│
├── actions/
│   ├── paypal/
│   │   ├── create-order.ts
│   │   ├── capture-payment.ts
│   │   └── verify-payment.ts
│   │
│   ├── user/
│   │   ├── get-user.ts
│   │   ├── update-user.ts
│   │   └── delete-user.ts
│   │
│   ├── product/
│   │   ├── get-products.ts
│   │   ├── get-product.ts
│   │   ├── create-product.ts
│   │   ├── update-product.ts
│   │   └── delete-product.ts
│   │
│   ├── order/
│   │   ├── create-order.ts
│   │   ├── get-orders.ts
│   │   ├── get-order.ts
│   │   └── update-order-status.ts
│   │
│   ├── cart/
│   │   ├── add-to-cart.ts
│   │   ├── remove-from-cart.ts
│   │   ├── update-cart-item.ts
│   │   └── get-cart.ts
│   │
│   └── auth/
│       ├── authenticate.ts
│       ├── register.ts
│       └── reset-password.ts
│
├── types/
│   ├── paypal.types.ts
│   ├── forms.types.ts
│   ├── payment.types.ts
│   ├── shipping.types.ts
│   ├── checkout.types.ts
│   ├── order.types.ts
│   ├── cart.types.ts
│   ├── product.types.ts
│   └── auth.types.ts
│
├── constants/
│   ├── checkout.ts
│   ├── index.ts
│   ├── paypal.ts
│   ├── form.ts
│   ├── shipping.ts
│   ├── payment.ts
│   ├── app.ts
│   ├── products.ts
│   └── auth.ts
│
└── validators/
    ├── shipping/
    │   ├── address.validator.ts
    │   └── postal-code.validator.ts
    │
    ├── product/
    │   ├── price.validator.ts
    │   └── stock.validator.ts
    │
    ├── payment/
    │   ├── credit-card.validator.ts
    │   └── payment-method.validator.ts
    │
    ├── order/
    │   ├── order-status.validator.ts
    │   └── order-items.validator.ts
    │
    ├── auth/
    │   ├── email.validator.ts
    │   └── password.validator.ts
    │
    ├── currency/
    │   └── amount.validator.ts
    │
    ├── checkout/
    │   └── checkout-form.validator.ts
    │
    └── cart/
        └── cart-item.validator.ts
```

## Exemplos de Conteúdo dos Arquivos

### Utils

**paypal.utils.ts**
```typescript
export function formatPayPalAmount(amount: number): string {
  return amount.toFixed(2);
}

export function generatePayPalClientToken(): string {
  // Lógica para gerar token para o cliente
}
```

### Helpers

**cart.helpers.ts**
```typescript
import { CartItem } from '../types/cart.types';

export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}
```

### Actions

**paypal/create-order.ts**
```typescript
"use server";

import { formatPayPalAmount } from '../../utils/paypal.utils';
import { CartItem } from '../../types/cart.types';

export async function createPayPalOrder(items: CartItem[]) {
  // Lógica para criar uma ordem no PayPal
}
```

### Types

**product.types.ts**
```typescript
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}
```

### Constants

**payment.ts**
```typescript
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  PAYPAL: 'paypal',
  BANK_TRANSFER: 'bank_transfer',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};
```

### Validators

**payment/credit-card.validator.ts**
```typescript
export function validateCreditCardNumber(cardNumber: string): { isValid: boolean; message?: string } {
  // Remove espaços e traços
  const sanitizedNumber = cardNumber.replace(/[\s-]/g, '');
  
  // Verifica se contém apenas dígitos
  if (!/^\d+$/.test(sanitizedNumber)) {
    return { isValid: false, message: "O número do cartão deve conter apenas dígitos" };
  }
  
  // Verifica comprimento do número (a maioria dos cartões tem entre 13-19 dígitos)
  if (sanitizedNumber.length < 13 || sanitizedNumber.length > 19) {
    return { isValid: false, message: "Comprimento do número do cartão inválido" };
  }
  
  // Implementação do algoritmo de Luhn (mod 10)
  let sum = 0;
  let doubleUp = false;
  
  for (let i = sanitizedNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitizedNumber.charAt(i));
    
    if (doubleUp) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    doubleUp = !doubleUp;
  }
  
  if (sum % 10 !== 0) {
    return { isValid: false, message: "Número de cartão inválido" };
  }
  
  return { isValid: true };
}
``` 