# Homebridge Tuya Pet Feeder F14W

A Homebridge plugin for controlling the Tuya Pet Feeder F14W.

## Features

- Single feed control
- Multiple feed control with configurable portions
- Configurable wait time between portions
- Multi-language support (English, Italian)

## Installation

```bash
npm install -g homebridge-tuya-petfeeder-f14w
```

## Configuration

Add this to your Homebridge config.json:

```json
{
    "platforms": [
        {
            "platform": "TuyaPetFeederF14W",
            "name": "Pet Feeder F14W",
            "accessKey": "YOUR_TUYA_ACCESS_KEY",
            "secretKey": "YOUR_TUYA_SECRET_KEY",
            "countryCode": 39,
            "language": "en",
            "portions": 2,
            "waitTime": 5
        }
    ]
}
```

### Configuration Parameters

- `accessKey`: Your Tuya IoT Access Key
- `secretKey`: Your Tuya IoT Secret Key
- `countryCode`: Your country code (e.g., 39 for Italy, 1 for USA)
- `language`: Interface language ("en" or "it")
- `portions`: Number of portions for multiple feed (1-10)
- `waitTime`: Wait time between portions in seconds (5-30)

## Support

For bugs and feature requests, please open an issue on GitHub. 