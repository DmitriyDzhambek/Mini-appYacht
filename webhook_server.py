from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
import asyncio
import logging
from bot import webhook_handler, bot

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Создание FastAPI приложения
app = FastAPI(title="VeloPath Bot Webhook")

@app.post("/webhook")
async def webhook_endpoint(request: Request):
    """Эндпоинт для Telegram webhook"""
    try:
        # Получаем обновление от Telegram
        update_data = await request.json()
        logger.info(f"Received update: {update_data}")
        
        # Обрабатываем обновление через наш обработчик
        result = await webhook_handler(update_data)
        
        return JSONResponse(content=result)
        
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": str(e)}
        )

@app.get("/")
async def root():
    """Корневой эндпоинт для проверки"""
    return {"message": "VeloPath Bot Webhook Server is running"}

@app.get("/webhook/info")
async def webhook_info():
    """Информация о webhook"""
    try:
        webhook_info = await bot.get_webhook_info()
        return {
            "webhook_url": webhook_info.url,
            "pending_update_count": webhook_info.pending_update_count,
            "last_error_date": webhook_info.last_error_date,
            "last_error_message": webhook_info.last_error_message
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/webhook/set")
async def set_webhook(request: Request):
    """Установка webhook"""
    try:
        data = await request.json()
        webhook_url = data.get("webhook_url")
        
        if not webhook_url:
            raise HTTPException(status_code=400, detail="webhook_url is required")
        
        await bot.set_webhook(webhook_url)
        return {"status": "success", "webhook_url": webhook_url}
        
    except Exception as e:
        logger.error(f"Set webhook error: {e}")
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": str(e)}
        )

@app.post("/webhook/delete")
async def delete_webhook():
    """Удаление webhook"""
    try:
        await bot.delete_webhook()
        return {"status": "success", "message": "Webhook deleted"}
        
    except Exception as e:
        logger.error(f"Delete webhook error: {e}")
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": str(e)}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
