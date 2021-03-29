/**
 * あいさつ＆出欠確認BOT
 *
 * 指定時刻に指定チャンネルにメッセージ送信
 * スプレッドシートで管理されているユーザーが返信をしないと5分おきにメンションづけて呼び出し
 * ただし、3回まで（定数は変更可能）
 *
 * スプレッドシートフォーマット(mensionは管理用で未使用)
 * time | mension   | userid
 * 9:00 | ユーザー名 | ユーザーID
 *
 */

const greetingMessage =
  "<!channel>\nおはようございます！起きている方はこちらにリアクションをお願いします！";

function myFunction() {
  const messagePostTime = "08:00";
  const sheet = SpreadsheetApp.openById("<ユーザー管理用スプレッドシート>");
  const timeIndex = 0;
  const mensionIndex = 2;
  var range = sheet.getRange("A:C");
  var value = range.getValues();
  var row = value.filter(String);

  var today = new Date();
  var day = today.getDay();
  if (day == 0 || day == 6) {
    return;
  }
  var currentTime = Utilities.formatDate(today, "JST", "HH:mm");

  // 全体へ挨拶メッセージを送信する時間か
  if (currentTime == messagePostTime) {
    // メッセージ投稿
    postMessage(greetingMessage);
  }

  for (var i = 1; i < row.length; i++) {
    if (value[i][timeIndex] != "") {
      //console.log(value[i][2]);

      // 記入時刻から５分ごとに３回まで呼びかけを行う
      for (var j = 0; j < 1; j++) {
        var date = new Date(value[i][timeIndex]);
        date.setMinutes(date.getMinutes() + 5 * j);

        // デッドライン
        var alertTime = Utilities.formatDate(date, "JST", "HH:mm");

        // 起床チェックする時刻か
        if (alertTime == currentTime) {
          // slackのメッセージを取得、リアクションをしているかチェック
          // リアクションしていなかったらメンションつきで連絡
          var reactions = getMessageReactions();
          if (
            !checkIsUserReactions(value[i][mensionIndex], getMessageReactions())
          ) {
            postMessage(
              "<@" + value[i][mensionIndex] + ">" + "\n起床していますか？"
            );
          }
        }
      }
    }
  }
}

var slackWebhookUrl = "<slack webhook URL>";

/*
 * 対象チャンネルにメッセージを送る
 */
function postMessage(message) {
  var data = {
    text: message,
    channel: "#greeting",
    //    'username':"alter",
    icon_emoji: ":sunrise:"
  };

  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(data)
  };

  UrlFetchApp.fetch(slackWebhookUrl, options);
}

/*
 *チャンネルのメッセージを取得し、Botの最新の挨拶のリアクションを取得し返却する
 */
function getMessageReactions() {
  const botId = "<作成したBOTID>";
  const token = "<bot token>";
  const channelId = "<投稿するチャンネルID>";

  var url =
    "https://slack.com/api/conversations.history?" +
    "token=" +
    token +
    "&channel=" +
    channelId +
    "&limit=" +
    100;

  var response = UrlFetchApp.fetch(url);
  var messages = JSON.parse(response.getContentText()).messages;
  var reactions = null;

  // BOTが発言したコメントかつあいさつ文である場合
  for (var i = 0; i < messages.length; i++) {
    if (messages[i].bot_id == botId && messages[i].text == greetingMessage) {
      reactions = messages[i].reactions;
      break;
    }
  }
  return reactions;
}

/*
 * 対象ユーザーが反応したかチェックをする
 */
function checkIsUserReactions(userId, reactions) {
  //  console.log(reactions);
  if (reactions == null) {
    return false;
  }
  let isReaction = false;

  // 対象userが何かしらのリアクションをしているか
  for (var i = 0; i < reactions.length; i++) {
    isReaction = reactions[i].users.includes(userId);
    if (isReaction) break;
  }
  return isReaction;
}
