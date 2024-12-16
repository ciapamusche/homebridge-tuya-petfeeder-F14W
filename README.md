# Homebridge Tuya Pet Feeder F14W

Il dispenser di crocchette di cui il tuo gatto non aveva bisogno: Implementazione base di un dispenser F14W basato su App Tuya Smart Life.

The kibble dispenser your cat didn't need: Basic implementation of an F14W dispenser based on Tuya Smart Life App.

## Caratteristiche | Features

- 🔄 Porzione singola | Single feed control
- 🔁 Porzioni multiple configurabili (1-10) | Multiple feed with configurable portions (1-10)
- ⏱️ Tempo di attesa configurabile tra le porzioni (5-30s) | Configurable wait time between portions (5-30s)
- 🌍 Supporto multilingua (IT/EN) | Multi-language support (IT/EN)
- 🌐 Supporto per diverse regioni Tuya | Support for different Tuya regions

## Installazione | Installation

```bash
npm install -g homebridge-tuya-petfeeder-f14w
```

## Configurazione | Configuration

Aggiungi questo al tuo file config.json di Homebridge | Add this to your Homebridge config.json:

```json
{
    "platforms": [
        {
            "platform": "TuyaPetFeederF14W",
            "name": "Pet Feeder F14W",
            "accessKey": "YOUR_TUYA_ACCESS_KEY",
            "secretKey": "YOUR_TUYA_SECRET_KEY",
            "countryCode": 39,
            "language": "it",
            "portions": 2,
            "waitTime": 5
        }
    ]
}
```

### Parametri di Configurazione | Configuration Parameters

- `accessKey`: La tua Tuya IoT Access Key | Your Tuya IoT Access Key
- `secretKey`: La tua Tuya IoT Secret Key | Your Tuya IoT Secret Key
- `countryCode`: Il tuo country code (es. 39 per Italia, 1 per USA) | Your country code (e.g., 39 for Italy, 1 for USA)
- `language`: Lingua dell'interfaccia ("it" o "en") | Interface language ("it" or "en")
- `portions`: Numero di porzioni per l'alimentazione multipla (1-10) | Number of portions for multiple feed (1-10)
- `waitTime`: Tempo di attesa tra le porzioni in secondi (5-30) | Wait time between portions in seconds (5-30)

### Country Codes Supportati | Supported Country Codes

- 🇮🇹 Italia (39) - Region: EU
- 🇫🇷 Francia (33) - Region: EU
- 🇪🇸 Spagna (34) - Region: EU
- 🇩🇪 Germania (49) - Region: EU
- 🇬🇧 Regno Unito (44) - Region: EU
- 🇳🇱 Paesi Bassi (31) - Region: EU
- 🇷🇺 Russia (7) - Region: EU
- 🇺🇦 Ucraina (380) - Region: EU
- 🇺🇸 USA (1) - Region: US
- 🇲🇽 Messico (52) - Region: US
- 🇧🇷 Brasile (55) - Region: US
- 🇨🇳 Cina (86) - Region: CN
- 🇮🇳 India (91) - Region: IN
- 🇰🇷 Corea del Sud (82) - Region: KR
- 🇯🇵 Giappone (81) - Region: JP

## Come Ottenere le Chiavi Tuya | How to Get Tuya Keys

1. Crea un account su [Tuya IoT Platform](https://iot.tuya.com/)
2. Crea un nuovo progetto Cloud
3. Vai su "Cloud" -> "Development" -> "Project" per trovare le tue chiavi
4. Usa l'Access Key e la Secret Key nel file di configurazione

## Supporto | Support

Per bug e richieste di funzionalità, apri una issue su GitHub.
For bugs and feature requests, please open an issue on GitHub. 