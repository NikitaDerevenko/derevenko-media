/**
 * Посредник для Telegram в Google Apps Script.
 * Зачем: из облака в России api.telegram.org заблокирован, а серверы Google — нет.
 * Функция заявок (cloud/lead) шлёт сюда {secret, text}, скрипт пересылает сообщение в Telegram.
 *
 * Настройка (один раз): Свойства проекта (⚙ «Настройки проекта» → «Свойства скрипта»):
 *   TOKEN   — токен бота от @BotFather
 *   CHAT_ID — id чата, куда слать заявки
 *   SECRET  — любой длинный пароль; тот же вписывается в функцию как TG_RELAY_SECRET
 * Развернуть: «Начать развертывание» → «Веб-приложение», запуск от моего имени, доступ «Все».
 */
function doPost(e) {
  var props = PropertiesService.getScriptProperties();
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json({ ok: false, error: 'bad_json' });
  }
  if (!props.getProperty('SECRET') || data.secret !== props.getProperty('SECRET')) {
    return json({ ok: false, error: 'forbidden' });
  }
  var res = UrlFetchApp.fetch('https://api.telegram.org/bot' + props.getProperty('TOKEN') + '/sendMessage', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      chat_id: props.getProperty('CHAT_ID'),
      text: String(data.text || '').slice(0, 4000),
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
    muteHttpExceptions: true,
  });
  var code = res.getResponseCode();
  return json({ ok: code === 200, code: code });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
