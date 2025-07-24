"use client";

import React, { useState } from "react";
import styles from "./valor.module.css";
import { Check, Download, Monitor, Volume2 } from "lucide-react";

export default function PricingPlans() {
  const [billingPeriod, setBillingPeriod] = useState("monthly");

  const plans = [
    {
      name: "Básico com Anúncios",
      price: "R$29,90",
      features: [
        { icon: Monitor, text: "2 dispositivos ao mesmo tempo" },
        { icon: Monitor, text: "Resolução Full HD" },
      ],
    },
    {
      name: "Standard",
      price: "R$39,90",
      features: [
        { icon: Monitor, text: "2 dispositivos ao mesmo tempo" },
        { icon: Monitor, text: "Resolução Full HD" },
        { icon: Download, text: "30 downloads para curtir off-line" },
      ],
    },
    {
      name: "Platinum",
      price: "R$55,90",
      features: [
        { icon: Monitor, text: "4 dispositivos ao mesmo tempo" },
        { icon: Monitor, text: "Resolução Full HD e 4K Ultra HD" },
        { icon: Volume2, text: "Áudio Dolby Atmos" },
        { icon: Download, text: "100 downloads para curtir off-line" },
      ],
      popular: true,
    },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>ESCOLHA O MELHOR PLANO PARA VOCÊ</h1>

          <div className={styles.toggleGroup}>
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`${styles.toggleBtn} ${
                billingPeriod === "monthly" ? styles.active : ""
              }`}
            >
              MENSAL
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`${styles.toggleBtn} ${
                billingPeriod === "yearly" ? styles.active : ""
              }`}
            >
              ANUAL PARCELADO
            </button>
          </div>
        </div>

        <div className={styles.cards}>
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`${styles.card} ${
                plan.popular ? styles.popular : ""
              }`}
            >
              <h3>{plan.name}</h3>

              <div className={styles.features}>
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className={styles.featureItem}>
                    <Check className={styles.checkIcon} />
                    <feature.icon className={styles.icon} />
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>

              <div className={styles.priceBox}>
                <div className={styles.price}>
                  {plan.price}
                  <span className={styles.priceNote}>/mês</span>
                </div>
              </div>

              <button className={styles.ctaBtn}>ESCOLHA SEU PLANO</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}