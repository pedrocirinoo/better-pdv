import { Product, Operator } from './types';

export const PRODUCTS: Product[] = [
  { code: '7891000055120', name: 'Leite Integral Ninho 1L', price: 7.49 },
  { code: '7891149103326', name: 'Arroz Tio João 5kg', price: 24.90 },
  { code: '7896004004501', name: 'Feijão Carioca Camil 1kg', price: 8.99 },
  { code: '7891910000197', name: 'Óleo Soya 900ml', price: 6.79 },
  { code: '7894900011517', name: 'Coca-Cola 2L', price: 9.99 },
  { code: '7622210670519', name: 'Biscoito Oreo 144g', price: 5.49 },
  { code: '7896045104482', name: 'Macarrão Renata 500g', price: 4.29 },
  { code: '7891000244876', name: 'Nescafé Original 100g', price: 12.90 },
  { code: '7891150047051', name: 'Sabão em Pó OMO 1kg', price: 18.50 },
  { code: '7896098900023', name: 'Pão de Forma Wickbold 500g', price: 8.20 },
  { code: '7891000315407', name: 'Chocolate Nestlé Classic 150g', price: 7.30 },
  { code: '7896024711400', name: 'Iogurte Danone Natural 170g', price: 3.99 },
  { code: '2000001000000', name: 'Banana Prata', price: 5.99, unit: 'kg' },
  { code: '2000002000000', name: 'Tomate Italiano', price: 8.49, unit: 'kg' },
  { code: '2000003000000', name: 'Maçã Fuji', price: 9.99, unit: 'kg' },
];

export const INITIAL_OPERATORS: Operator[] = [
  { id: 1, name: 'Maria Aparecida', initials: 'MA', pin: '0000', fundoCaixa: 200, history: [] },
  { id: 2, name: 'João Carlos', initials: 'JC', pin: '0000', fundoCaixa: 200, history: [] },
  { id: 3, name: 'Ana Souza', initials: 'AS', pin: '0000', fundoCaixa: 200, history: [] },
  { id: 4, name: 'Roberto Lima', initials: 'RL', pin: '0000', fundoCaixa: 200, history: [] },
];
