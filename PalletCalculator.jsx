import React, { useState } from "react";
import articoli from "../data/articoli.json";
import { calcolaConfigurazioneSingola } from "./helpers.js";

const PalletCalculator = () => {
  const [righe, setRighe] = useState([{ articolo: "", scatole: "" }]);
  const [pallets, setPallets] = useState([]);
  const [tipoPallet, setTipoPallet] = useState("Entrambi");

  const handleChange = (index, campo, valore) => {
    const nuoveRighe = [...righe];
    nuoveRighe[index][campo] = valore;
    setRighe(nuoveRighe);
  };

  const aggiungiRiga = () => {
    setRighe([...righe, { articolo: "", scatole: "" }]);
  };

  const rimuoviRiga = (index) => {
    const nuoveRighe = [...righe];
    nuoveRighe.splice(index, 1);
    setRighe(nuoveRighe);
  };

  const calcola = () => {
    const configsTotali = [];

    const righeRaggruppate = righe.reduce((acc, { articolo, scatole }) => {
      if (!acc[articolo]) acc[articolo] = 0;
      acc[articolo] += parseInt(scatole);
      return acc;
    }, {});

    Object.entries(righeRaggruppate).forEach(([articolo, scatoleTotali]) => {
      const art = articoli.find(a => a.name === articolo);
      if (!art) return;

      const configs80 = art.configurazioni.filter(c => c.tipo_pallet === "120x80" && c.altezza <= 192);
      const configs100 = art.configurazioni.filter(c => c.tipo_pallet === "120x100" && c.altezza <= 192);

      let configs = [];

      if (tipoPallet === "Solo 120x80") configs = calcolaConfigurazioneSingola(configs80, [], scatoleTotali);
      else if (tipoPallet === "Solo 120x100") configs = calcolaConfigurazioneSingola([], configs100, scatoleTotali);
      else configs = calcolaConfigurazioneSingola(configs80, configs100, scatoleTotali);

      if (!configs) return;

      configs.forEach(config => {
        configsTotali.push({
          articolo,
          scatole: config.scatole,
          altezza: config.altezza,
          peso: config.peso,
          bancale: config.tipo_pallet,
        });
      });
    });

    configsTotali.sort((a, b) => a.altezza - b.altezza);

    const altezzaSomma = configsTotali.reduce((sum, c) => sum + c.altezza, 0);
    const pesoSomma = configsTotali.reduce((sum, c) => sum + c.peso, 0);
    const articoliUnici = [...new Set(configsTotali.map(c => c.articolo))].length;
    const bancaleUnico = configsTotali.some(c => c.bancale === "120x100") ? "120x100" : "120x80";

    const altezzaFinaleUnico = altezzaSomma - (15 * (articoliUnici - 1));
    const pesoFinaleUnico = pesoSomma - (10 * (articoliUnici - 1));

    if (altezzaFinaleUnico <= 192) {
      setPallets([{
        articoli: configsTotali.map(c => c.articolo).join(" + "),
        scatole: configsTotali.reduce((sum, c) => sum + c.scatole, 0),
        altezza: altezzaFinaleUnico,
        peso: pesoFinaleUnico,
        bancale: bancaleUnico,
      }]);
      return;
    }

    const palletsFinali = [];
    let palletInCorso = [];
    let altezzaPallet = 0;

    configsTotali.forEach(config => {
      if (altezzaPallet + config.altezza <= 192) {
        palletInCorso.push(config);
        altezzaPallet += config.altezza;
      } else {
        palletsFinali.push([...palletInCorso]);
        palletInCorso = [config];
        altezzaPallet = config.altezza;
      }
    });

    if (palletInCorso.length) {
      palletsFinali.push(palletInCorso);
    }

    const palletsUniti = palletsFinali.map(pallet => {
      const sommaAltezze = pallet.reduce((sum, p) => sum + p.altezza, 0);
      const pesoLordo = pallet.reduce((sum, p) => sum + p.peso, 0);
      const articoliDiversi = [...new Set(pallet.map(p => p.articolo))].length;
      const bancale = pallet.some(p => p.bancale === "120x100") ? "120x100" : "120x80";

      const altezzaFinale = articoliDiversi > 1 ? sommaAltezze - (15 * (articoliDiversi - 1)) : sommaAltezze;
      const pesoFinale = articoliDiversi > 1 ? pesoLordo - (10 * (articoliDiversi - 1)) : pesoLordo;

      return {
        articoli: pallet.map(p => p.articolo).join(" + "),
        scatole: pallet.reduce((sum, p) => sum + p.scatole, 0),
        altezza: altezzaFinale,
        peso: pesoFinale,
        bancale,
      };
    });

    setPallets(palletsUniti);
  };

  return (
    <div className="pallet-calculator">
      <h2>Calcolo Pallet</h2>

      {righe.map((riga, index) => (
        <div key={index}>
          <select value={riga.articolo} onChange={(e) => handleChange(index, "articolo", e.target.value)}>
            <option value="">Seleziona Articolo</option>
            {articoli.map((art, idx) => (
              <option key={idx} value={art.name}>{art.name}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="N° Scatole"
            value={riga.scatole}
            onChange={(e) => handleChange(index, "scatole", e.target.value)}
          />

          <button onClick={() => rimuoviRiga(index)}>-</button>
        </div>
      ))}

      <button onClick={aggiungiRiga}>+ Aggiungi Riga</button>

      <div style={{ marginTop: '10px' }}>
        Tipo Pallet:
        <select value={tipoPallet} onChange={(e) => setTipoPallet(e.target.value)}>
          <option value="Entrambi">Entrambi</option>
          <option value="Solo 120x80">Solo 120x80</option>
          <option value="Solo 120x100">Solo 120x100</option>
        </select>
      </div>

      <button onClick={calcola}>RICALCOLA PALLET</button>

      <h3>Risultato:</h3>

      {pallets.length === 0 ? (
        <p>Nessun pallet calcolato</p>
      ) : (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Articolo/i</th>
              <th>Scatole</th>
              <th>Altezza</th>
              <th>Peso</th>
              <th>Bancale</th>
            </tr>
          </thead>
          <tbody>
            {pallets.map((p, index) => (
              <tr key={index}>
                <td>{p.articoli}</td>
                <td>{p.scatole}</td>
                <td>{p.altezza} cm</td>
                <td>{p.peso} kg</td>
                <td>{p.bancale}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PalletCalculator;
