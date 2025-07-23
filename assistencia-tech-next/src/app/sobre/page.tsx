"use client";

import React, { useState } from "react";
import styles from "./funciona.module.css";

const ComoFunciona: React.FC = () => {
  const [perfil, setPerfil] = useState<"cliente" | "especialista">("cliente");

  const etapasCliente = [
    {
      numero: "01",
      titulo: "Entre em nosso site",
      texto:
        "Ela vai servir para você solicitar os orçamentos pela 'Nome site' e seus dados ficarão seguros, respeitando a LGPD.",
    },
    {
      numero: "02",
      titulo: "Escolha o serviço que quer contratar",
      texto:
        "Temos 09 opções de serviços para atender suas necessidades. Basta encontrar o que precisa e selecionar para começar a receber os orçamentos.",
    },
    {
      numero: "03",
      titulo: "Receba propostas de vários clientes",
      texto:
        "Sua demanda vai chegar para os nossos especialistas em segundos. Eles irão te enviar as propostas pelo WhatsApp, para facilitar a sua escolha.",
    },
    {
      numero: "04",
      titulo: "Contrate o especialista que preferir",
      texto:
        "Você escolhe qual profissional vai te atender com base na avaliação, valor etc.",
    },
    {
      numero: "05",
      titulo: "Pague com segurança",
      texto:
        "Plataforma segura para pagamento, sem burocracia e com opção de parcelamento.",
    },
  ];

  const etapasEspecialista = [
    {
      numero: "01",
      titulo: "Cadastre-se gratuitamente",
      texto:
        "Crie sua conta em poucos cliques para começar a receber solicitações.",
    },
    {
      numero: "02",
      titulo: "Escolha suas especialidades",
      texto:
        "Você seleciona os serviços que oferece e a região de atuação.",
    },
    {
      numero: "03",
      titulo: "Receba pedidos de clientes",
      texto:
        "Receba uma notificação com os detalhes do pedido assim que solicitado.",
    },
    {
      numero: "04",
      titulo: "Envie seu orçamento",
      texto:
        "Envie sua proposta pelo WhatsApp e negocie com o cliente.",
    },
    {
      numero: "05",
      titulo: "Ganhe dinheiro fazendo o que sabe",
      texto:
        "Feche o serviço e receba com segurança via plataforma.",
    },
  ];

  return (
    <div>
      <section className={styles["perfil-container"]}>
        <div className={styles["perfil-tabs"]}>
          <button
            className={`${styles.tab} ${styles.cliente} ${
              perfil === "cliente" ? styles.active : ""
            }`}
            onClick={() => setPerfil("cliente")}
          >
            Quero Contratar
          </button>
          <button
            className={`${styles.tab} ${styles.especialista} ${
              perfil === "especialista" ? styles.active : ""
            }`}
            onClick={() => setPerfil("especialista")}
          >
            Sou Especialista
          </button>
        </div>
        <div
          className={styles.indicador}
          style={{
            backgroundColor: perfil === "cliente" ? "#3b79c9" : "#f16e6e",
          }}
        >
          Como funciona a Servify
        </div>
      </section>

      <section className={styles["linha-do-tempo"]}>
        <h1>
          {perfil === "cliente"
            ? "Quer começar a contratar especialistas? É muito simples!"
            : "Quer começar a receber pedidos? Veja como é fácil!"}
        </h1>
        <div className={styles["etapas-container"]}>
          {(perfil === "cliente" ? etapasCliente : etapasEspecialista).map(
            (etapa) => (
              <div className={styles.etapa} key={etapa.numero}>
                <span className={styles.numero}>{etapa.numero}</span>
                <div className={styles.conteudo}>
                  <h2>{etapa.titulo}</h2>
                  <p>{etapa.texto}</p>
                </div>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
};

export default ComoFunciona;
