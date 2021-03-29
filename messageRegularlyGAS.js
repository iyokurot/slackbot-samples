// post message
// GASにて一定間隔実行設定でメッセージ送信

var slackWebhookUrl = "<slack webhookURL>";

function firstApp() {
  var data = {
    text: "こんにちは！今日も頑張りましょう！ :山の日の出:"
  };

  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(data)
  };

  UrlFetchApp.fetch(slackWebhookUrl, options);
}
