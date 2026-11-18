# NettoStipendio.it — Calcolo Stipendio Netto CCNL 2026

Piattaforma web interattiva e autonoma per il calcolo dello stipendio netto in busta paga, aggiornata con la **Riforma Fiscale IRPEF a 3 scaglioni**, detrazioni lavoro dipendente (art. 13 TUIR) e minimi tabellari dei principali contratti collettivi nazionali (CCNL).

## Caratteristiche Principali
1. **Calcolo Istantaneo Bidirezionale:**
   - *Da RAL a Netto*: calcolo su 12, 13 o 14 mensilità con dettaglio IRPEF, INPS, addizionali regionali/comunali, TFR e buoni pasto esentasse.
   - *Da Netto Desiderato a RAL (Calcolo Inverso)*: indica al lavoratore quanta RAL richiedere in sede di colloquio e trattativa.
2. **Minimi Tabellari CCNL Integrati:**
   - CCNL Commercio e Terziario (Confcommercio)
   - CCNL Metalmeccanico Industria (Federmeccanica)
   - CCNL Turismo e Pubblici Esercizi (Fipe/Federalberghi)
   - CCNL Studi Professionali (Confprofessioni)
   - CCNL Telecomunicazioni e IT
   - CCNL Cooperative Sociali e Sanità Privata
3. **Monetizzazione Integrata (Fintech & Banche):**
   - **Conti Correnti & Carte a Canone 0€:** BBVA / Revolut (affiliazione 30€-50€ per apertura conto).
   - **Cessione del Quinto / Prestiti:** Comparatore integrato (lead generation 50€-80€ a preventivo).
   - **Google AdSense:** Spazi pubblicitari e `ads.txt` già configurati.

## Struttura del Progetto
- `web/index.html`: Web App responsive (Tailwind CSS + Chart.js).
- `web/fiscal_engine.js`: Motore fiscale 2025/2026 client-side (zero costi server).
- `web/ccnl_retribuzioni.json`: Database minimi contrattuali e declaratorie di livello.
- `web/ads.txt`: Verifica publisher Google AdSense.
- `vercel.json`: Configurazione per deploy istantaneo su Vercel.
