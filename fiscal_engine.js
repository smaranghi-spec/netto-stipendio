/**
 * Motore Fiscale Italiano 2025/2026 per Calcolo Stipendio Netto Dipendenti
 * Aggiornato con Nuova IRPEF a 3 Scaglioni (D.Lgs. 216/2023 & Legge di Bilancio),
 * Detrazioni lavoro dipendente innalzate a 1.955€ e riforma Cuneo Fiscale.
 */

const FiscalEngine = {
  // Aliquote IRPEF a 3 scaglioni
  SCAGLIONI_IRPEF: [
    { fino_a: 28000, aliquota: 0.23 },
    { fino_a: 50000, aliquota: 0.35 },
    { fino_a: Infinity, aliquota: 0.43 }
  ],

  // Aliquote Addizionali Regionali indicative medie
  ADDIZIONALI_REGIONALI: {
    "lombardia": 0.0133,
    "lazio": 0.0203,
    "campania": 0.0203,
    "veneto": 0.0123,
    "emilia_romagna": 0.0153,
    "piemonte": 0.0182,
    "toscana": 0.0142,
    "sicilia": 0.0123,
    "puglia": 0.0143,
    "liguria": 0.0153,
    "marche": 0.0153,
    "umbria": 0.0153,
    "abruzzo": 0.0173,
    "fvg": 0.0123,
    "trentino": 0.0123,
    "sardegna": 0.0123,
    "calabria": 0.0173,
    "basilicata": 0.0123,
    "molise": 0.0193,
    "valle_aosta": 0.0123,
    "media": 0.0150
  },

  // Aliquota previdenziale INPS ordinaria carico dipendente
  INPS_ALIQUOTA_BASE: 0.0919,

  /**
   * Calcola il netto a partire dalla Retribuzione Annua Lorda (RAL)
   */
  calcolaDaRal: function(params) {
    const ral = Math.max(0, parseFloat(params.ral) || 0);
    const mensilita = parseInt(params.mensilita) || 13;
    const regione = params.regione || "media";
    const figliCarico = parseInt(params.figliCarico) || 0;
    const coniugeCarico = !!params.coniugeCarico;
    const buoniPastoUnitario = parseFloat(params.buoniPastoUnitario) || 0;
    const giorniBuoniPasto = parseInt(params.giorniBuoniPasto) || 20;

    // 1. Contributi Previdenziali INPS a carico dipendente
    let inpsDovuta = ral * this.INPS_ALIQUOTA_BASE;

    // Sgravio Cuneo Fiscale / Trattamento integrativo contributivo
    let sgravioCuneo = 0;
    if (ral > 0 && ral <= 25000) {
      sgravioCuneo = ral * 0.035; // Riduzione contributiva ~3.5%
    } else if (ral > 25000 && ral <= 35000) {
      sgravioCuneo = ral * 0.025; // Riduzione contributiva ~2.5%
    } else if (ral > 35000 && ral <= 40000) {
      // Decalage progressivo tra 35k e 40k
      sgravioCuneo = (ral * 0.025) * ((40000 - ral) / 5000);
    }
    inpsDovuta = Math.max(0, inpsDovuta - sgravioCuneo);

    // 2. Imponibile Fiscale (IRPEF)
    const imponibileIrpef = Math.max(0, ral - inpsDovuta);

    // 3. IRPEF Lorda (Calcolo a scaglioni)
    let irpefLorda = 0;
    let residuo = imponibileIrpef;
    let precedenteSoglia = 0;

    for (const scaglione of this.SCAGLIONI_IRPEF) {
      if (residuo <= 0) break;
      const ampiezza = scaglione.fino_a - precedenteSoglia;
      const imponibileNelLivello = Math.min(residuo, ampiezza);
      irpefLorda += imponibileNelLivello * scaglione.aliquota;
      residuo -= imponibileNelLivello;
      precedenteSoglia = scaglione.fino_a;
    }

    // 4. Detrazioni da Lavoro Dipendente (Art. 13 TUIR 2025/2026)
    let detrazioneLavoro = 0;
    if (imponibileIrpef <= 15000) {
      detrazioneLavoro = 1955;
    } else if (imponibileIrpef > 15000 && imponibileIrpef <= 28000) {
      detrazioneLavoro = 1910 + 1190 * ((28000 - imponibileIrpef) / 13000);
      if (imponibileIrpef >= 25000 && imponibileIrpef <= 28000) {
        detrazioneLavoro += 65; // Correttivo di salvaguardia
      }
    } else if (imponibileIrpef > 28000 && imponibileIrpef <= 50000) {
      detrazioneLavoro = 1910 * ((50000 - imponibileIrpef) / 22000);
      if (imponibileIrpef > 28000 && imponibileIrpef <= 35000) {
        detrazioneLavoro += 65 * ((35000 - imponibileIrpef) / 7000);
      }
    } else {
      detrazioneLavoro = 0;
    }

    // 5. Detrazioni Familiari a carico (Coniuge & Figli > 21 anni non coperti da Assegno Unico)
    let detrazioneCarichi = 0;
    if (coniugeCarico && imponibileIrpef <= 80000) {
      if (imponibileIrpef <= 15000) detrazioneCarichi += 800;
      else if (imponibileIrpef <= 40000) detrazioneCarichi += 690;
      else detrazioneCarichi += 690 * ((80000 - imponibileIrpef) / 40000);
    }
    if (figliCarico > 0 && imponibileIrpef <= 95000) {
      const quotaFiglio = 950 * ((95000 - imponibileIrpef) / 95000);
      detrazioneCarichi += Math.max(0, quotaFiglio * figliCarico);
    }

    // 6. IRPEF Netta
    const totaleDetrazioni = detrazioneLavoro + detrazioneCarichi;
    const irpefNetta = Math.max(0, irpefLorda - totaleDetrazioni);

    // 7. Addizionale Regionale e Comunale (media standard ~1.5% e ~0.8%)
    const aliquotaRegionale = this.ADDIZIONALI_REGIONALI[regione] || this.ADDIZIONALI_REGIONALI["media"];
    const addizionaleRegionale = imponibileIrpef * aliquotaRegionale;
    const addizionaleComunale = (imponibileIrpef > 15000) ? (imponibileIrpef * 0.008) : 0; // Esenzione tipica sotto i 15k

    // 8. Trattamento Integrativo Ex Bonus Renzi (DL 3/2020) fino a 15.000€
    let trattamentoIntegrativo = 0;
    if (imponibileIrpef > 8500 && imponibileIrpef <= 15000 && irpefLorda > detrazioneLavoro) {
      trattamentoIntegrativo = 1200; // 100€ al mese
    }

    // 9. Calcolo Totale Trattenute e Netto Annuo
    const totaleTasse = irpefNetta + addizionaleRegionale + addizionaleComunale;
    const totaleTrattenute = inpsDovuta + totaleTasse;
    const nettoAnnuoBase = ral - totaleTrattenute + trattamentoIntegrativo;

    // 10. Netto Mensile
    const nettoMensileBase = nettoAnnuoBase / mensilita;

    // 11. Buoni Pasto (esentasse fino a 8€ elettronici al giorno)
    const valoreBuoniPastoMensile = buoniPastoUnitario * giorniBuoniPasto;
    const nettoMensileTotaleInTasca = nettoMensileBase + valoreBuoniPastoMensile;

    // 12. TFR Maturato (Liquidazione di fine rapporto accantonata annualmente)
    // TFR lordo = RAL / 13.5 - contributo 0.5% INPS
    const tfrAnnuo = (ral / 13.5) - (ral * 0.005);
    const costoAziendaleTotale = ral * 1.32; // Include contributi INPS/INAIL carico datore (~32%)

    return {
      ral: Math.round(ral),
      mensilita: mensilita,
      nettoMensileBase: Math.round(nettoMensileBase * 100) / 100,
      nettoMensileTotale: Math.round(nettoMensileTotaleInTasca * 100) / 100,
      nettoAnnuo: Math.round(nettoAnnuoBase),
      inpsAnnuo: Math.round(inpsDovuta),
      irpefLorda: Math.round(irpefLorda),
      detrazioniTotali: Math.round(totaleDetrazioni),
      irpefNetta: Math.round(irpefNetta),
      addizionaleRegionale: Math.round(addizionaleRegionale),
      addizionaleComunale: Math.round(addizionaleComunale),
      trattamentoIntegrativo: Math.round(trattamentoIntegrativo),
      totaleTrattenute: Math.round(totaleTrattenute),
      tfrAnnuo: Math.round(tfrAnnuo),
      buoniPastoMensili: Math.round(valoreBuoniPastoMensile),
      costoAziendaStimato: Math.round(costoAziendaleTotale),
      pressioneFiscalePercentuale: ral > 0 ? Math.round((totaleTrattenute / ral) * 1000) / 10 : 0
    };
  },

  /**
   * Calcolo Inverso: Trova la RAL necessaria per ottenere un desiderato stipendio netto mensile
   */
  calcolaRalDaNettoDesiderato: function(nettoDesiderato, mensilita, regione) {
    const targetNetto = parseFloat(nettoDesiderato) || 0;
    if (targetNetto <= 0) return 0;

    // Ricerca binaria per precisione assoluta a 1€
    let minRal = targetNetto * (mensilita || 13);
    let maxRal = targetNetto * (mensilita || 13) * 2.5;
    let stimaRal = (minRal + maxRal) / 2;

    for (let i = 0; i < 40; i++) {
      const res = this.calcolaDaRal({
        ral: stimaRal,
        mensilita: mensilita,
        regione: regione
      });

      const scarto = res.nettoMensileBase - targetNetto;
      if (Math.abs(scarto) < 0.5) {
        break; // Trovato con precisione al centesimo
      }

      if (scarto > 0) {
        maxRal = stimaRal;
      } else {
        minRal = stimaRal;
      }
      stimaRal = (minRal + maxRal) / 2;
    }

    return Math.round(stimaRal);
  }
};

// Export per Node.js o Browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FiscalEngine;
}
