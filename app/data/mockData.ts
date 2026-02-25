export const MOCK_GAMES = [
  {
    id: "g1",
    date: new Date().toISOString().split("T")[0],
    homeTeam: "LG",
    awayTeam: "KIA",
    homeScore: 3,
    awayScore: 5,
    stadium: "잠실",
    status: "종료"
  },
  {
    id: "g2",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0], // Yesterday
    homeTeam: "SSG",
    awayTeam: "NC",
    homeScore: 8,
    awayScore: 2,
    stadium: "문학",
    status: "종료"
  }
];

export const MOCK_REVIEWS = [
  {
    id: "r1",
    userId: "u1",
    userNickname: "야구조아",
    gameId: "g1",
    rating: 4.5,
    comment: "기아 화이팅! 원정 응원 꿀잼 ㅋㅋㅋ 폼 미쳤다",
    location: "직관(원정석)",
    companion: "친구들",
    createdAt: new Date().toISOString()
  },
  {
    id: "r2",
    userId: "u2",
    userNickname: "엘지없인못살아",
    gameId: "g1",
    rating: 2.0,
    comment: "투수 교체 타이밍 실화냐... ㅠㅠ",
    location: "집관",
    companion: "혼자",
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];
