const { TuyaOpenApiClient } = require('@tuya/tuya-connector-nodejs');

class TuyaPetFeederPlatform {
  constructor(log, config, api) {
    this.log = log;
    this.config = config;
    this.api = api;
    this.accessories = [];
    this.isDispensingMultiple = false;

    // Verifica configurazione
    if (!config.accessKey || !config.secretKey || !config.countryCode) {
      log.error('Missing configuration. Make sure to configure accessKey, secretKey and countryCode in the plugin settings.');
      return;
    }

    // Device ID fisso per F14W
    this.tuyaDeviceId = 'bf855390913fb040b2thq5';
    this.homekitDeviceId = 'bf855390913fb040b2thq5-F14W';

    // Mappa dei country code alle regioni
    const countryToRegion = {
      // Western Europe
      39: 'eu', // Italy
      33: 'eu', // France
      34: 'eu', // Spain
      49: 'eu', // Germany
      44: 'eu', // United Kingdom
      31: 'eu', // Netherlands
      // Eastern Europe
      7: 'eu',  // Russia
      380: 'eu', // Ukraine
      // Americas
      1: 'us',   // USA
      52: 'us',  // Mexico
      55: 'us',  // Brazil
      // Asia
      86: 'cn',  // China
      91: 'in',  // India
      82: 'kr',  // South Korea
      81: 'jp',  // Japan
      // Default
      0: 'eu'    // Default to EU if unknown
    };

    // Mappa delle regioni agli URL base
    const regionUrls = {
      eu: 'https://openapi.tuyaeu.com',
      us: 'https://openapi.tuyaus.com',
      cn: 'https://openapi.tuyacn.com',
      in: 'https://openapi.tuyain.com',
      kr: 'https://openapi.tuyakr.com',
      jp: 'https://openapi.tuyajp.com'
    };

    // Determina la regione in base al country code
    const region = countryToRegion[config.countryCode] || countryToRegion[0];
    const baseUrl = regionUrls[region];

    this.log.debug('Country code mapping:', {
      countryCode: config.countryCode,
      mappedRegion: region,
      baseUrl: baseUrl
    });

    // Inizializzazione API Tuya
    this.tuya = new TuyaOpenApiClient({
      baseUrl: baseUrl,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
      countryCode: config.countryCode
    });

    this.log.info('TuyaPetFeeder F14W platform initialized');

    if (api) {
      // Save the API object as plugin needs to register new accessory via this object
      this.api = api;

      // Listen to event "didFinishLaunching", this means homebridge already finished loading cached accessories.
      // Platform Plugin should only register new accessory that doesn't exist in homebridge after this event.
      // Or start discover new accessories.
      this.api.on('didFinishLaunching', () => {
        this.log.info('Registering device...');
        this.registerDevice();
      });
    }
  }

  configureAccessory(accessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  async registerDevice() {
    try {
      const uuid = this.api.hap.uuid.generate(this.homekitDeviceId);
      const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
      
      if (existingAccessory) {
        this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
        this.setupAccessory(existingAccessory);
      } else {
        this.log.info('Adding new accessory');
        const accessory = new this.api.platformAccessory("Pet Feeder F14W", uuid);
        this.setupAccessory(accessory);
        this.api.registerPlatformAccessories("homebridge-tuya-petfeeder-F14W", "TuyaPetFeederF14W", [accessory]);
        this.accessories.push(accessory);
      }
    } catch (error) {
      this.log.error('Error registering device:', error);
    }
  }

  setupAccessory(accessory) {
    // Definizione delle stringhe localizzate
    const strings = {
      en: {
        singleFeed: "Single Feed",
        multipleFeed: "Multiple Feed"
      },
      it: {
        singleFeed: "Porzione Singola",
        multipleFeed: "Porzioni Multiple"
      }
    };

    // Usa la lingua configurata o default a inglese
    const lang = this.config.language || 'en';
    const t = strings[lang] || strings.en;

    // Aggiungi informazioni sul dispositivo
    const infoService = accessory.getService(this.api.hap.Service.AccessoryInformation);
    if (!infoService) {
      accessory.addService(this.api.hap.Service.AccessoryInformation)
        .setCharacteristic(this.api.hap.Characteristic.Manufacturer, "Tuya")
        .setCharacteristic(this.api.hap.Characteristic.Model, "F14-W")
        .setCharacteristic(this.api.hap.Characteristic.SerialNumber, this.tuyaDeviceId)
        .setCharacteristic(this.api.hap.Characteristic.FirmwareRevision, "1.0.0");
    }

    // Ottieni o crea i servizi
    let singleService = accessory.getService('SingleFeed');
    let multiService = accessory.getService('MultiFeed');

    // Se i servizi non esistono, creali
    if (!singleService) {
      singleService = accessory.addService(this.api.hap.Service.Switch, 'SingleFeed', 'single-feed');
    }
    if (!multiService) {
      multiService = accessory.addService(this.api.hap.Service.Switch, 'MultiFeed', 'multi-feed');
    }

    // Aggiorna i nomi configurati
    singleService.setCharacteristic(this.api.hap.Characteristic.ConfiguredName, t.singleFeed);
    multiService.setCharacteristic(this.api.hap.Characteristic.ConfiguredName, t.multipleFeed);
    
    singleService.getCharacteristic(this.api.hap.Characteristic.On)
      .onSet(async (value) => {
        try {
          if (!value) return; // Ignora l'evento OFF

          this.log.info('Dispensing single portion');
          
          // 1. Manda il comando
          await this.tuya.request({
            path: `/v1.0/devices/${this.tuyaDeviceId}/commands`,
            method: 'POST',
            body: {
              commands: [
                {
                  code: 'manual_feed',
                  value: 1
                }
              ]
            }
          });

          // 2. Attendi 2 secondi per essere sicuri che l'operazione sia completata
          await new Promise(resolve => setTimeout(resolve, 2000));

          // 3. Switch OFF
          setTimeout(() => {
            singleService.setCharacteristic(this.api.hap.Characteristic.On, false);
          }, 100);
          
        } catch (error) {
          this.log.error('Error dispensing single portion:', error);
          throw error;
        }
      });

    // Switch per porzioni multiple
    multiService.getCharacteristic(this.api.hap.Characteristic.On)
      .onSet(async (value) => {
        try {
          if (!value) return; // Ignora l'evento OFF
          if (this.isDispensingMultiple) {
            this.log.info('Multiple feed already in progress, ignoring request');
            return;
          }

          const portions = this.config.portions || 2;
          const waitTime = (this.config.waitTime || 5) * 1000;
          
          this.isDispensingMultiple = true;
          this.log.info(`Starting to dispense ${portions} portions with ${waitTime/1000}s wait time`);
          
          // Funzione per erogare una singola porzione
          const dispensePortion = async (portionNumber) => {
            this.log.info(`Dispensing portion ${portionNumber} of ${portions}`);
            
            // 1. Manda il comando
            await this.tuya.request({
              path: `/v1.0/devices/${this.tuyaDeviceId}/commands`,
              method: 'POST',
              body: {
                commands: [
                  {
                    code: 'manual_feed',
                    value: 1
                  }
                ]
              }
            });

            // 2. Attendi 2 secondi per essere sicuri che l'operazione sia completata
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 3. Se non è l'ultima porzione, attendi il tempo configurato
            if (portionNumber < portions) {
              this.log.info(`Waiting ${waitTime/1000} seconds before next portion...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
            }
          };

          try {
            // Eroga tutte le porzioni in sequenza
            for (let i = 1; i <= portions; i++) {
              await dispensePortion(i);
            }

            this.log.info('All portions dispensed');
          } finally {
            // Assicurati che il flag venga resettato anche in caso di errori
            this.isDispensingMultiple = false;
          }
          
          // Switch OFF dopo che tutte le porzioni sono state erogate
          setTimeout(() => {
            multiService.setCharacteristic(this.api.hap.Characteristic.On, false);
          }, 100);
          
        } catch (error) {
          this.log.error('Error dispensing portions:', error);
          this.isDispensingMultiple = false;
          throw error;
        }
      });
  }
}

module.exports = (homebridge) => {
  homebridge.registerPlatform('homebridge-tuya-petfeeder-F14W', 'TuyaPetFeederF14W', TuyaPetFeederPlatform);
};

