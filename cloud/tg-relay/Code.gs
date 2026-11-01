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
      reply_markup: data.reply_markup || undefined,
    }),
    muteHttpExceptions: true,
  });
  var code = res.getResponseCode();
  return json({ ok: code === 200, code: code });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Оформление профиля бота: имя, описание и короткое описание.
 * Запускать вручную из редактора (выбрать setupBotProfile → «Выполнить»). Результат — в журнале выполнения.
 */
function setupBotProfile() {
  var token = PropertiesService.getScriptProperties().getProperty('TOKEN');
  var calls = [
    ['setMyName', { name: 'Заявки · Никита Деревенко' }],
    ['setMyShortDescription', { short_description: 'Заявки с сайта derevenko-media.ru' }],
    ['setMyDescription', { description: 'Сюда приходят заявки с сайта derevenko-media.ru: имя, контакт, задача и откуда пришёл клиент. Кнопки под сообщением сразу открывают чат с ним в Telegram или WhatsApp.' }],
  ];
  calls.forEach(function (c) {
    var res = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/' + c[0], {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(c[1]),
      muteHttpExceptions: true,
    });
    Logger.log(c[0] + ': ' + res.getResponseCode() + ' ' + res.getContentText().slice(0, 200));
  });
}
