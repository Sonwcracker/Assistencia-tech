"use client";

import React, { useState, useEffect } from "react";
import styles from "./valor.module.css";
import { Check, Download } from "lucide-react";

export default function PricingPlans() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [fade, setFade] = useState("fade-in");

  useEffect(() => {
    setFade("fade-out");
    const timeout = setTimeout(() => {
      setFade("fade-in");
    }, 200);
    return () => clearTimeout(timeout);
  }, [billingPeriod]);

  const plans = [
    {
      name: "Plano Básico",
      price: billingPeriod === "monthly" ? "R$29,90" : "R$200,00",
      features: [
        { text: "Você estará dentro da nossa página" },
      ],
    },
    {
      name: "Plano Pro",
      price: billingPeriod === "monthly" ? "R$39,90" : "R$1.000,00",
      features: [
        { text: "estara dentro do site" },
        { text: "ficara em maior evidencia dentro do site." },
      ],
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
            <div key={index} className={styles.card}>
              <h3>{plan.name}</h3>

              <div className={styles.features}>
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className={styles.featureItem}>
                    <Check className={styles.checkIcon} />
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>

              <div className={styles.priceBox}>
                <div className={`${styles.price} ${styles[fade]}`}>
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