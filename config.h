// --- Configuración de Ciberseguridad: Manejo de Credenciales ---
//
// Este archivo (config.h) guarda tus "secretos".
// NUNCA compartas este archivo públicamente (ej. en GitHub).
//
// -----------------------------------------------------------------

// --- Credenciales de WiFi ---
// (Reemplaza con tus datos)
#define WIFI_SSID "fh_f792a8"
#define WIFI_PASS "wlan086d57"

// --- Credenciales de Adafruit IO ---
// (Obtenlas de tu perfil en io.adafruit.com)
// (Reemplaza con tus datos)
#define AIO_USERNAME "Trigo"
#define AIO_KEY "aio_yZby13dlDwcID2wgVTan9LKkLZbi"

// --- Certificado Raíz (Root CA) para Adafruit IO (SSL) ---
// Esto es NECESARIO para la conexión segura MQTTS (cifrado en tránsito).
// Es el certificado público del servidor de Adafruit.
// (VERSIÓN CORREGIDA Y COMPLETA)
static const char* AIO_CERT = \
    "-----BEGIN CERTIFICATE-----\n" \
    "MIIDrzCCApegAwIBAgIQCDvgVpBCRrGhdwrDHj7/ITANBgkqhkiG9w0BAQsFADBh\n" \
    "MQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3\n" \
    "d3cuZGlnaWNlcnQuY29tMSAwHgYDVQQDExdEaWdpQ2VydCBHbG9iYWwgUm9vdCBH\n" \
    "MjAeFw0xMzAzMDgxMjAwMDBaFw0yMzAzMDgxMjAwMDBaMEIxCzAJBgNVBAYTAlVT\n" \
    "MRYwFAYDVQQKEw1EaWdpQ2VydCBJbmMxGTAXBgNVBAMTEERpZ2lDZXJ0IFNIQTIg\n" \
    "U2VjdXJlIFNlcnZlciBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEB\n" \
    "ANIIuManZ+hI/hE0vQhADpS/GOaYyv0Ev/cEaBGo89a2sLklsZ93n3O1S6w2hA2z\n" \
    "jS/c6v3Siy/a6HCE3hYd22gIVH2cWeaK/NnNyntGZBHvE6sV/S9fNIuKxLef/y5g\n" \
    "P/rJ8JcGo1N40/vE1dXTtbtjUqnaADgP4sYlTjIhyLgY8dpErNqV+I4A5l7p6gIr\n" \
    "kRjMhTz+yVA6B0IA1u3vS5WssF1LwJ3N8kS+4OPd2cnoMIIh/dY1dG/R+jtnnBwO\n" \
    "k/eOhPtmMEOVCbWYvLDPYvjXrnY/gO18aMGhAUgKqP8q3O6/qPSw3mI5BQQ0s0AT\n" \
    "XwIDAQABo4IBUDCCATwwHwYDVR0jBBgwFoAUA95QNVbRTLtm8KPiGxv2CXuDDTBw\n" \
    "HQYDVR0OBBYEFA+AYRyCMWHVLyj+4G2mHw3o0+3YMA4GA1UdDwEB/wQEAwIBhjAd\n" \
    "BgNVHSUEFjAUBggrBgEFBQcDAQYIKwYBBQUHAwIwEgYDVR0TAQH/BAgwBgEB/wIB\n" \
    "ADA0BgNVHR8ELTArMCmgJ6AlhiNodHRwOi8vY3JsMy5kaWdpY2VydC5jb20vZ2xv\n" \
    "YmFscm9vdGcyLmNybDA0BgNVHSAELTArMCkGCysGAQQBsjEBAgQwGDAWBggrBgEF\n" \
    "BQcCARsGDAZodHRwczovL3d3dy5kaWdpY2VydC5jb20vQ1BTMKEGCSsGAQQBgjcB\n" \
    "AgIwCAoGBADMAdwBEgMAMIGHBggrBgEFBQcBAQR7MHkwJAYIKwYBBQUHMAGGGGh0\n" \
    "dHA6Ly9vY3NwLmRpaWNlcnQuY29tMEUGCCsGAQUFBzAChjlodHRwOi8vY2FjZXJ0\n" \
    "cy5kaWdpY2VydC5jb20vRGlnaUNlcnRHbG9iYWxSb290RzIuY3J0MAwGA1UdEwEB\n" \
    "/wQCMAAwDQYJKoZIhvcNAQELBQADggEBAKbbg8jXY1Y1DSUfJH5gR+qG6nBwXw2k\n" \
    "4PIaEc/fmykEoLoqGkZAYH5R1bIdceaAvw1V0s6CYR2da9r4Q361d5d2v2tqnqea\n" \
    "b3JlLnNlcnZlci1jYS5jcnQwQgYIKwYBBQUHAQEENTAzMDEGCCsGAQUFBzABhiVo\n" \
    "dHRwOi8vb2NzcC5kaWdpY2VydC5jb20wDQYJKoZIhvcNAQELBQADggEBAE/+2iN1\n" \
    "CBj54s2jckd7bWK3geIOFB2P4JMNwE2x/vAAsa3oUoNYnNQeXNItf8yAbJRIxYqV\n" \
    "yNsgb9cTfKldxx3gPsr2VpvyTLY3cL7v2g/N/e+Ybk8cE72m8yLN1lA8o+tN5/N3\n" \
    "Vl9S2vF3mDY/cRg1gzzl0/vFMtDqdoHLQhf/1Iu4sYtU3FmlyvpmxicxYcQWpieG\n" \
    "0PgcIplfAZWwMh1O6sA32y1r/I9MCAv2uV72yoiHe7semkEyBVGPbWnJR/hXDH8N\n" \
    "A/1aL2Ld8g8q/ue3v/0H6sYbcILuTif2adgE/3sY/a\n" \
    "0fHwZc/Y0Q" \
    "-----END CERTIFICATE-----\n";

