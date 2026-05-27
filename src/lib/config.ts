export const DATA_BASE_URL =
  "https://raw.githubusercontent.com/smoqadam/gw-exam/refs/heads/main/data"

export const manifestUrl = () => `${DATA_BASE_URL}/manifest.json`

export const examUrl = (examId: string) => `${DATA_BASE_URL}/${examId}.json`

export const audioUrl = (examId: string, teil: string) =>
  `${DATA_BASE_URL}/audio/${examId}_hoer${teil}.mp3`
