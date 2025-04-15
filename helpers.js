export const trovaConfigurazioneEsatta = (configs, scatoleRichieste) =>
    configs.find(c => c.scatole === scatoleRichieste);
  
  export const trovaConfigurazioneInferiore = (configs, scatoleRichieste) =>
    configs.filter(c => c.scatole < scatoleRichieste).sort((a, b) => b.scatole - a.scatole)[0];
  
  export const trovaConfigurazioneSuperiore = (configs, scatoleRichieste) =>
    configs.filter(c => c.scatole > scatoleRichieste).sort((a, b) => a.scatole - b.scatole)[0];
  
  export const calcolaPesoParziale = (config, scatoleRichieste) =>
    Math.ceil((config.peso / config.scatole) * scatoleRichieste);
  
  const creaConfigParziale = (configs, scatoleRichieste) => {
    const inferiore = trovaConfigurazioneInferiore(configs, scatoleRichieste) || configs[0];
    const superiore = trovaConfigurazioneSuperiore(configs, scatoleRichieste) || inferiore;
  
    return {
      scatole: scatoleRichieste,
      peso: calcolaPesoParziale(inferiore, scatoleRichieste),
      altezza: superiore.altezza,
      tipo_pallet: superiore.tipo_pallet,
    };
  };
  
  export const calcolaConfigurazioneSingola = (configs80, configs100, scatoleRichieste) => {
    const configs = [];
  
    let scatoleRimaste = scatoleRichieste;
  
    while (scatoleRimaste > 0) {
      const max80 = Math.max(...configs80.map(c => c.scatole), 0);
      const max100 = Math.max(...configs100.map(c => c.scatole), 0);
  
      let config = null;
  
      if (max80 >= scatoleRimaste) {
        config = trovaConfigurazioneEsatta(configs80, scatoleRimaste) || creaConfigParziale(configs80, scatoleRimaste);
      } else if (max100 >= scatoleRimaste) {
        config = trovaConfigurazioneEsatta(configs100, scatoleRimaste) || creaConfigParziale(configs100, scatoleRimaste);
      } else {
        // Non ci stanno tutte, prendo max possibile in 100 o 80
        if (max100 >= max80 && max100 > 0) {
          config = configs100.find(c => c.scatole === max100);
        } else if (max80 > 0) {
          config = configs80.find(c => c.scatole === max80);
        } else {
          break; // Se proprio non ci sono config valide
        }
      }
  
      if (!config) break;
  
      configs.push({
        scatole: config.scatole,
        peso: config.peso,
        altezza: config.altezza,
        tipo_pallet: config.tipo_pallet,
      });
  
      scatoleRimaste -= config.scatole;
    }
  
    return configs.length ? configs : null;
  };
