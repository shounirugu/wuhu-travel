export const aiStatsData = {
  dates: ['5/26', '5/27', '5/28', '5/29', '5/30', '5/31', '6/1'],
  series: [
    { name: '智能问答',   data: [42, 58, 65, 71, 88, 95, 103] },
    { name: '路线规划',   data: [18, 25, 30, 28, 45, 52,  61] },
    { name: '个性化推荐', data: [12, 19, 22, 35, 40, 48,  55] },
  ],
}

export const todayAiCount = aiStatsData.series.reduce(
  (sum, s) => sum + s.data[s.data.length - 1],
  0
)
