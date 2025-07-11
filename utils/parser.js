// utils/parser.js

/**
 * 解析指令字串，回傳指令名稱與參數陣列
 * 
 * @param {string} input - 使用者輸入的字串（如訊息內容）
 * @param {string} prefix - 指令前綴字，例如 '!' 或 '/'
 * @returns {Object|null} 回傳 { command: string, args: string[] }，若非指令則回 null
 */
function parseCommand(input, prefix = '!') {
  if (typeof input !== 'string') return null;

  input = input.trim();

  if (!input.startsWith(prefix)) {
    return null; // 非指令訊息
  }

  // 去除前綴字
  const withoutPrefix = input.slice(prefix.length).trim();

  // 用空白分割
  const split = withoutPrefix.split(/\s+/);

  if (split.length === 0) return null;

  const command = split[0].toLowerCase();
  const args = split.slice(1);

  return { command, args };
}

module.exports = {
  parseCommand,
};
