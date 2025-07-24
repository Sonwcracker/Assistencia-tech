"use client";

import React, { useState } from 'react';
import { Check, Download, Monitor, Volume2 } from 'lucide-react';

export default function PricingPlans() {
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  const plans = [
    {
      name: 'Básico com Anúncios',
      price: 'R$29,90',
      features: [
        { icon: Monitor, text: '2 dispositivos ao mesmo tempo' },
        { icon: Monitor, text: 'Resolução Full HD' }
      ]
    },
    {
      name: 'Standard',
      price: 'R$39,90',
      features: [
        { icon: Monitor, text: '2 dispositivos ao mesmo tempo' },
        { icon: Monitor, text: 'Resolução Full HD' },
        { icon: Download, text: '30 downloads para curtir off-line' }
      ]
    },
    {
      name: 'Platinum',
      price: 'R$55,90',
      features: [
        { icon: Monitor, text: '4 dispositivos ao mesmo tempo' },
        { icon: Monitor, text: 'Resolução Full HD e 4K Ultra HD' },
        { icon: Volume2, text: 'Áudio Dolby Atmos' },
        { icon: Download, text: '100 downloads para curtir off-line' }
      ],
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">ESCOLHA O MELHOR PLANO PARA VOCÊ</h1>
          <p className="text-gray-400 text-lg mb-8">ECONOMIZE ATÉ 36%</p>

          <div className="inline-flex bg-gray-800 rounded-full p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-8 py-3 rounded-full transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-black font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              MENSAL
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-8 py-3 rounded-full transition-all ${
                billingPeriod === 'yearly'
                  ? 'bg-white text-black font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ANUAL PARCELADO
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white text-black rounded-2xl p-8 h-fit ${
                plan.popular ? 'ring-4 ring-blue-500 transform scale-105' : ''
              }`}
            >
              <h3 className="text-2xl font-bold mb-8">{plan.name}</h3>

              <div className="space-y-4 mb-12">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex items-center space-x-2">
                      <feature.icon className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-800">{feature.text}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mb-8">
                <div className="text-4xl font-bold text-black mb-2">
                  {plan.price}
                  <span className="text-lg font-normal text-gray-600">/mês</span>
                </div>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-colors">
                ESCOLHA SEU PLANO
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}