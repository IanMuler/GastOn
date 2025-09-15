# 🚀 Instrucciones de Deployment en Render - GastOn Backend

## ✅ Archivos Ya Configurados

Los siguientes archivos ya están listos para el deployment en Render:

- ✅ `render.yaml` - Configuración de infraestructura como código
- ✅ `backend/package.json` - Node.js 20.x especificado
- ✅ `backend/.env.example` - Template de variables de entorno para Render
- ✅ `backend/src/config/environment.js` - PORT dinámico configurado (compatible con Render)
- ✅ `mobile/.env` - URL de producción de Render preparada

## 🌐 ¿Qué es Render?

Render es una plataforma cloud moderna que ofrece:
- ✨ **Deployment automático** desde Git (GitHub, GitLab, Bitbucket)
- 🔒 **Certificados SSL gratuitos** y CDN global
- 🛡️ **Protección DDoS** incluida
- 🆓 **Tier gratuito generoso** para web apps y bases de datos
- ⚡ **Más rápido y moderno** que Heroku

## 🔧 Opciones de Deployment

### Opción A: Deploy Automático con render.yaml (RECOMENDADO)

#### Paso 1: Subir el Código a GitHub
```bash
# Asegúrate de que todos los cambios estén en tu repo de GitHub
git add .
git commit -m "feat: configure backend for Render deployment"
git push origin main
```

#### Paso 2: Conectar con Render
1. Ve a [render.com](https://render.com) y crea una cuenta gratuita
2. Conecta tu cuenta de GitHub
3. Click en **"New"** → **"Blueprint"**
4. Selecciona tu repositorio `GastOn`
5. Render detectará automáticamente el archivo `render.yaml`
6. Click en **"Apply"** para crear todos los servicios

#### Paso 3: Actualizar la URL del Repo
En `render.yaml`, actualiza la línea:
```yaml
repo: https://github.com/TU_USUARIO/GastOn.git
```

### Opción B: Deploy Manual desde Dashboard

#### Paso 1: Crear Web Service
1. En el dashboard de Render, click **"New"** → **"Web Service"**
2. Conecta tu repositorio de GitHub `GastOn`
3. Configura:
   - **Name**: `gaston-backend-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

#### Paso 2: Configurar Variables de Entorno
En la sección "Environment", añade:

```bash
# Base de datos Neon (actual)
DATABASE_URL=postgresql://neondb_owner:npg_5WV4aUNbKAFD@ep-muddy-pond-aez764um-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Configuración del servidor
NODE_ENV=production
CORS_ORIGIN=*

# Seguridad
JWT_SECRET=gaston_jwt_secret_2025_secure_render

# Pool de conexiones (opcional)
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_CONNECTION_TIMEOUT=2000
```

## 💾 Opciones de Base de Datos

### Opción A: Mantener Neon PostgreSQL (RECOMENDADO)
- ✅ **Ya configurada** con datos iniciales
- ✅ **Permanente** - no expira
- ✅ **0.5 GB storage** gratuito
- ✅ **Sin configuración adicional** requerida

### Opción B: Usar PostgreSQL de Render
1. En el dashboard, click **"New"** → **"PostgreSQL"**
2. Configura:
   - **Name**: `gaston-postgres`
   - **Database Name**: `gaston_db`
   - **User**: `gaston_user`
   - ⚠️ **Limitación**: Expira después de 90 días
3. Copia la `DATABASE_URL` generada
4. Actualiza las variables de entorno de tu web service

## 🌐 URLs de Producción

Una vez deployado, tu API estará disponible en:

- **Base URL**: `https://gaston-aq7o.onrender.com`
- **Health Check**: `https://gaston-aq7o.onrender.com/health`
- **API Endpoints**: `https://gaston-aq7o.onrender.com/api/*`

### Endpoints Principales:
- `GET /api/categories` - Obtener categorías
- `GET /api/expense-names` - Obtener nombres de gastos
- `GET /api/expenses/weekly/current` - Gastos de la semana actual
- `GET /api/expenses/dashboard` - Dashboard resumen

## 📱 Configurar Frontend para Producción

### Para usar Producción:
En `mobile/.env`, cambiar:
```env
# Comentar la línea local
# EXPO_PUBLIC_API_URL=http://192.168.1.50:3000

# Descomentar la línea de producción
EXPO_PUBLIC_API_URL=https://gaston-aq7o.onrender.com
```

### Para volver a desarrollo local:
Simplemente revierte los comentarios en el archivo `.env`.

## 📊 Monitoreo y Mantenimiento

### Ver Logs en Tiempo Real
1. Ve a tu web service en el dashboard de Render
2. Click en la pestaña **"Logs"**
3. Logs en tiempo real automáticamente disponibles

### Ver Métricas
- **CPU y Memory usage** en la pestaña "Metrics"
- **Request analytics** disponibles
- **Health checks** automáticos

### Reiniciar el Servicio
1. Ve a la pestaña **"Settings"**
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

## 💰 Información del Plan Gratuito

### Render Free Tier:
- ✅ **750 horas gratis** por mes por servicio
- ⚠️ **Sleep después de 15 min** de inactividad
- ⏱️ **10-20 segundos** para despertar (más rápido que Heroku)
- 💾 **512MB RAM**
- 🌍 **SSL y CDN** incluidos

### Base de Datos:
#### Con Neon (Recomendado):
- ✅ **0.5 GB storage**
- ✅ **Sin expiración**
- ✅ **Ya configurada**

#### Con Render PostgreSQL:
- ✅ **1 GB storage**
- ⚠️ **Expira en 90 días**
- ✅ **Backup automático**

## 🔄 Actualizaciones Automáticas

### Auto-Deploy desde Git (VENTAJA vs Heroku)
```bash
# 1. Hacer cambios en el código
# 2. Commit y push
git add .
git commit -m "feat: nuevas funcionalidades"
git push origin main

# 3. ¡Render deploya automáticamente! 🎉
# No necesitas comandos manuales como en Heroku
```

### Deploy Manual (si es necesario)
1. Ve al dashboard de Render
2. Click **"Manual Deploy"**
3. Selecciona el commit específico

## ⚡ Ventajas de Render vs Heroku

| Característica | Render | Heroku |
|---------------|--------|---------|
| Auto-deploy | ✅ Automático desde Git | ❌ Manual con CLI |
| SSL/TLS | ✅ Gratis e incluido | ✅ Gratis |
| Tiempo de inicio | ⚡ 10-20 seg | 🐌 30+ seg |
| Configuración | 📄 render.yaml (declarativo) | 🔧 CLI commands |
| Dashboard | 🎨 Moderno y claro | 📊 Funcional básico |
| Logs | ✅ Tiempo real en dashboard | ✅ CLI únicamente |
| CDN | ✅ Global incluido | ❌ Add-on requerido |

## 🆘 Troubleshooting

### Si la app no inicia:
1. Ve a la pestaña **"Logs"** en el dashboard
2. Busca errores en variables de entorno o conexión a BD
3. Verifica que `NODE_ENV=production` esté configurado

### Si hay problemas de CORS:
- Verifica que `CORS_ORIGIN=*` esté en las variables de entorno
- O configura la URL específica de tu frontend

### Si la base de datos no conecta:
- Verifica la `DATABASE_URL` en variables de entorno
- Para Neon: confirma que la URL tenga `sslmode=require`
- Para Render PostgreSQL: usa la URL generada automáticamente

### Si el servicio está "sleeping":
- El servicio despierta automáticamente con la primera request
- Para mantenerlo activo, puedes usar servicios como UptimeRobot (gratuito)

### Deploy falla:
1. Verifica que `package.json` tenga scripts `start`
2. Confirma que Node.js version está especificada en `engines`
3. Revisa que no haya errores en build command

## 🎉 ¡Listo para Producción!

Una vez completados estos pasos:
1. ✅ Tu backend estará corriendo en Render
2. ✅ Deploy automático desde Git configurado
3. ✅ SSL y CDN incluidos
4. ✅ Logs y métricas disponibles
5. ✅ Tu app móvil puede conectarse a la API

**Costo total: $0/mes** 💚

### URLs Finales:
- **API**: https://gaston-aq7o.onrender.com
- **Health Check**: https://gaston-aq7o.onrender.com/health
- **Dashboard**: [Dashboard de Render](https://dashboard.render.com)

---

## 📚 Recursos Adicionales

- [Documentación oficial de Render](https://render.com/docs)
- [Guía de Node.js en Render](https://render.com/docs/deploy-node-express-app)
- [Blueprint YAML Reference](https://render.com/docs/blueprint-spec)
- [Troubleshooting deploys](https://render.com/docs/troubleshooting-deploys)

**¡Render es más moderno, rápido y fácil que Heroku!** 🚀