import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FAQItem {
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    question: 'O que é a Peragus?',
    answer: 'A Peragus é uma infraestrutura de pagamentos cross-border que conecta moedas fiduciárias locais por meio de liquidação baseada em stablecoins.',
  },
  {
    question: 'Como funciona a operação?',
    answer: 'Você escolhe quanto quer pagar em moeda local, revisa a cotação e a taxa, conecta ou informa uma carteira de destino, conclui o pagamento local e recebe USDT diretamente nessa carteira.',
  },
  {
    question: 'A Peragus guarda fundos do cliente?',
    answer: 'Não. O USDT é entregue diretamente na carteira do cliente. A Peragus não cria saldo interno nem carteira custodial na plataforma.',
  },
  {
    question: 'Quanto tempo leva uma liquidação?',
    answer: 'O fluxo demonstrativo estima entrega entre 5 e 15 minutos após a confirmação do pagamento, dependendo da rede selecionada.',
  },
  {
    question: 'Quais redes são suportadas?',
    answer: 'O protótipo demonstra entrega de USDT em Ethereum, Polygon, Arbitrum e Optimism.',
  },
  {
    question: 'Qual o valor mínimo e máximo?',
    answer: 'O valor mínimo é de R$ 50,00. O valor máximo pode variar conforme o nível de verificação de identidade. Consulte os limites no momento da operação.',
  },
  {
    question: 'Quais dados são solicitados na operação?',
    answer: 'O fluxo pode solicitar dados básicos quando necessário para validação da operação, prevenção a fraude e obrigações regulatórias.',
  },
  {
    question: 'Posso cancelar uma operação?',
    answer: 'Operações com Pix já pago não podem ser canceladas. Certifique-se de revisar todos os dados antes de confirmar a liquidação.',
  },
]

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-2">
      {faqItems.map((item, idx) => {
        const isOpen = openIndex === idx
        return (
          <div
            key={idx}
            className="rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 hover:border-border-hover hover:shadow-md"
          >
            <button
              className="flex w-full items-center justify-between px-5 py-4 text-left press-effect"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${idx}`}
            >
              <span className="text-sm font-medium text-text-primary">{item.question}</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-text-tertiary transition-transform duration-300 ease-spring',
                  isOpen && 'rotate-180'
                )}
              />
            </button>
            <div
              id={`faq-answer-${idx}`}
              className={cn(
                'overflow-hidden transition-all duration-300 ease-spring',
                isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              )}
            >
              <p className="px-5 pb-4 text-sm text-text-secondary leading-relaxed">
                {item.answer}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
