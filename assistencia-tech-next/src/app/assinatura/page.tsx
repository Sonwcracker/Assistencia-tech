'use client';

import React, { useState, useEffect } from 'react';
import styles from './assinatura.module.css';
import { IoCheckmarkCircle } from 'react-icons/io5';

export default function AssinaturaPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [fade, setFade] = useState('fade-in');

  useEffect(() => {
    setFade('fade-out');
    const timeout = setTimeout(() => {
      setFade('fade-in');
    }, 200);
    return () => clearTimeout(timeout);
  }, [billingPeriod]);

  const plans = [
    {
      name: "Plano Básico",
      priceMonthly: "R$19,90",
      priceYearly: "R$15,90", // Exemplo de desconto (20%)
      features: [
        "Perfil visível na plataforma",
        "Até 10 contatos de clientes por mês",
        "Suporte por e-mail",
      ],
      isPopular: false,
    },
    {
      name: "Plano Pro",
      priceMonthly: "R$29,90",
      priceYearly: "R$23,90",
      features: [
        "Tudo do Plano Básico",
        "Contatos de clientes ilimitados",
        "Destaque nas buscas",
        "Selo de 'Profissional Verificado'",
        "Dashboard de performance",
      ],
      isPopular: true,
    },
    {
        name: "Plano Premium",
        priceMonthly: "R$59,90",
        priceYearly: "R$47,90",
        features: [
          "Tudo do Plano Pro",
          "Destaque máximo no topo das buscas",
          "Acesso prioritário a chamados urgentes",
          "Menor comissão por serviço",
          "Dashboard com insights de mercado",
        ],
        isPopular: false,
      },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Planos de Assinatura para Profissionais</h1>
          <p className={styles.subtitle}>Escolha o plano que melhor se adapta ao seu negócio e comece a receber mais clientes.</p>

          <div className={styles.toggleGroup}>
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`${styles.toggleBtn} ${billingPeriod === "monthly" ? styles.active : ""}`}
            >
              Faturamento Mensal
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`${styles.toggleBtn} ${billingPeriod === "yearly" ? styles.active : ""}`}
            >
              Faturamento Anual (Economize 20%)
            </button>
          </div>
        </div>

        <div className={styles.cards}>
          {plans.map((plan, index) => (
            <div key={index} className={`${styles.card} ${plan.isPopular ? styles.popular : ''}`}>
              {plan.isPopular && <div className={styles.popularBadge}>MAIS POPULAR</div>}
              <h3>{plan.name}</h3>
              
              <div className={styles.priceBox}>
                <div className={`${styles.price} ${styles[fade]}`}>
                  {billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceYearly}
                </div>
                <span className={styles.priceNote}>/mês</span>
              </div>
              
              <ul className={styles.features}>
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className={styles.featureItem}>
                    <IoCheckmarkCircle className={styles.checkIcon} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className={styles.ctaBtn}>Escolher Plano</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}