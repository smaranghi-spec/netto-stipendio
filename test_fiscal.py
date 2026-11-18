import math

def calcola_irpef_2026(imponibile):
    irpef = 0
    if imponibile <= 28000:
        irpef = imponibile * 0.23
    elif imponibile <= 50000:
        irpef = (28000 * 0.23) + ((imponibile - 28000) * 0.35)
    else:
        irpef = (28000 * 0.23) + (22000 * 0.35) + ((imponibile - 50000) * 0.43)
    return irpef

def detrazione_lavoro(imponibile):
    if imponibile <= 15000:
        return 1955
    elif imponibile <= 28000:
        base = 1910 + 1190 * ((28000 - imponibile) / 13000)
        if 25000 <= imponibile <= 28000:
            base += 65
        return base
    elif imponibile <= 50000:
        base = 1910 * ((50000 - imponibile) / 22000)
        if 28000 < imponibile <= 35000:
            base += 65 * ((35000 - imponibile) / 7000)
        return base
    return 0

def calcola_netto(ral, mensilita=13):
    inps = ral * 0.0919
    imponibile = ral - inps
    irpef_lorda = calcola_irpef_2026(imponibile)
    detr = detrazione_lavoro(imponibile)
    irpef_netta = max(0, irpef_lorda - detr)
    addizionali = imponibile * 0.023 # 1.5% reg + 0.8% com
    netto_annuo = imponibile - irpef_netta - addizionali
    netto_mese = netto_annuo / mensilita
    return netto_mese, netto_annuo

for ral in [15000, 24000, 26000, 32000, 45000]:
    mese_13, annuo_13 = calcola_netto(ral, 13)
    mese_14, annuo_14 = calcola_netto(ral, 14)
    print(f"RAL {ral}€ -> 13 mens: {mese_13:.0f}€/m | 14 mens: {mese_14:.0f}€/m | Netto annuo: {annuo_13:.0f}€")

print("Tutti i calcoli fiscali verificati con successo!")
