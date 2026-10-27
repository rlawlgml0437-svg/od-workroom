/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const ODI_CONTENT = {
  brand: {
    name: "오디워크룸",
    engName: "OD workroom",
    concept: "Freelance, not Friendless",
    slogan: "혼자 일하지만 고립되지 않는 곳",
    location: "경기도 김포시 김포한강1로 230, 801호",
    phone: "010-4668-5405",
    // 사업자 정보 (2026-09-21) — 네이버 GFA 비즈채널 심사: 광고계정 등록 정보와 사이트 하단 표기 일치 필수
    business: {
      company: "오디워크룸 커뮤니티 공유오피스",
      ceo: "김지희",
      registrationNumber: "529-23-02357",
      address: "경기도 김포시 김포한강1로 230, 801호",
      // 대표전화(대표 결정 2026-10-06). 업무폰 번호. 결제사 심사·검색 노출에 쓰인다.
      phone: "010-4985-0437",
    },
    contact: {
      kakao: "https://pf.kakao.com/_xkwkgn",
      instagram: "https://www.instagram.com/od.workroom",
      naverMap: "https://naver.me/5ZSaQygP",
      trial: "https://m.booking.naver.com/booking/10/bizes/1603452/items/7482030?theme=place&service-target=map-pc&lang=ko&area=plt&map-search=1",
      email: "odworkroom@naver.com"
    }
  },
  instagramFeed: [
    { id: 1, url: "/IMG_0180.JPG", link: "https://www.instagram.com/od.workroom" },
    { id: 2, url: "/IMG_1057.JPG", link: "https://www.instagram.com/od.workroom" },
    { id: 3, url: "/IMG_0504.JPG", link: "https://www.instagram.com/od.workroom" },
    { id: 4, url: "/IMG_0180.JPG", link: "https://www.instagram.com/od.workroom" },
    { id: 5, url: "/IMG_1057.JPG", link: "https://www.instagram.com/od.workroom" },
    { id: 6, url: "/IMG_0504.JPG", link: "https://www.instagram.com/od.workroom" }
  ],
  hero: {
    // 2026-10-27 개편: 스펙 중심 → 사람·커뮤니티 중심 (대표 지시)
    tagline: "Freelance, not Friendless",
    title: "혼자 일하지만,\n혼자는 아니에요",
    subtitle: "운양역 1분 · 24시간 · 프리랜서와 1인 사업자가 함께 일하는 커뮤니티 오피스",
    image: "/photos/web/community-002.webp", // 대표 확정 10/27: 창가 긴 테이블 3명 뒷모습
    buttons: [
      { text: "자유석 1일 무료 체험 예약", link: "#trial-application" },
      { text: "커뮤니티 둘러보기", link: "#community-moments" }
    ]
  },
  // '요즘 오디워크룸' — 살아있는 커뮤니티 기록. 매달 여기에 추가 (콘텐츠 세션)
  communityMoments: {
    nextEvent: {
      badge: "다음 모임",
      name: "AI 커피챗",
      date: "11월 6일 금요일",
      desc: "한 달의 AI 소식을 같이 따라잡고, 각자 써본 경험을 나눠요. 정기 회원이라면 누구나 참여할 수 있어요."
    },
    moments: [
      {
        title: "AI 스터디 #1 — 클로드로 릴스 편집해 보기",
        date: "2026.10.19",
        photo: "",
        note: "멤버가 직접 연 첫 스터디. 각자 노트북 들고 모여 릴스 한 편씩 만들었어요."
      },
      {
        title: "AI 커피챗 4회차 — 한 달 AI 뉴스 브리핑",
        date: "2026.10.02",
        photo: "/photos/web/community-005.webp",
        note: "이번 달에 나온 AI 소식 중 '내 일에 바로 쓸 것'만 골라서 수다 떨었어요."
      },
      {
        title: "정기 커피챗 — 열 명이 모인 날",
        date: "2026.07",
        photo: "/photos/web/moments-coffeechat-10.jpg",
        note: "일 얘기로 시작해서 동네 맛집 얘기로 끝났지만, 그게 커피챗이죠."
      }
    ]
  },
  // 멤버 한 줄 후기 — 대표가 확보하는 대로 채우면 자동 노출 (비어 있으면 섹션 숨김)
  testimonials: [] as { job: string; quote: string }[],
  intro: {
    title: "혼자 일하지만, 외롭지 않게.",
    description: "오디워크룸은 각자 조용히 일하다가도 자연스럽게 인사하고 커피 한 잔 나눌 수 있는 작업공간입니다. 억지스러운 네트워킹보다, 오래 일해도 편한 분위기를 중요하게 생각합니다."
  },
  targetAudience: [
    {
      title: "프리랜서",
      desc: "집에서는 집중이 안 되고, 카페는 눈치 보일 때. 나만의 루틴을 만들 수 있는 안정적인 작업 공간이 필요한 분.",
      icon: "User"
    },
    {
      title: "1인 사업가",
      desc: "혼자 결정하고 움직이는 시간이 많아, 비슷한 일을 하는 사람들과 가볍게 이야기 나눌 곳이 필요한 분.",
      icon: "Briefcase"
    },
    {
      title: "재택근무자",
      desc: "일과 삶의 분리가 필요할 때, 출근하듯 나와서 일하고 퇴근하듯 돌아갈 수 있어요.",
      icon: "Home"
    }
  ],
  atmosphere: {
    title: "카페의 편안함, 오피스의 몰입감",
    highlight: "백색 소음과 적당한 몰입감이 공존하는 공간이에요.",
    notice: "※ 오디워크룸은 완전한 무소음 공간이 아닙니다. 가벼운 인사와 소음이 허용되는 자유로운 분위기를 지향합니다.",
    images: [
      "/IMG_0180.JPG",
      "/IMG_1057.JPG",
      "/IMG_0504.JPG"
    ]
  },
  photoGallery: [
    {
      title: "자유석",
      desc: "창가와 긴 테이블을 오가며 그날의 루틴에 맞춰 앉을 수 있는 오픈 좌석입니다.",
      images: [
        "/photos/web/free-seat-001.webp",
        "/photos/web/free-seat-003.webp",
        "/photos/web/free-seat-006.webp",
        "/photos/web/free-seat-008.webp",
        "/photos/web/free-seat-007.webp",
        "/photos/web/free-seat-004.webp",
        "/photos/web/free-seat-005.webp",
        "/photos/web/free-seat-011.webp",
        "/photos/web/free-seat-009.webp",
        "/photos/web/free-seat-010.webp",
        "/photos/web/free-seat-002.webp"
      ]
    },
    {
      title: "전용석",
      desc: "개인 조명과 넓은 데스크가 준비된, 매일 바로 시작할 수 있는 고정 작업석입니다.",
      images: [
        "/photos/web/dedicated-seat-004.webp",
        "/photos/web/dedicated-seat-002.webp",
        "/photos/web/dedicated-seat-001.webp",
        "/photos/web/dedicated-seat-005.webp",
        "/photos/web/dedicated-seat-003.webp"
      ]
    },
    {
      title: "휴게라운지",
      desc: "커피와 간식, 소파와 창밖 풍경으로 잠깐의 쉼을 챙기는 멤버 전용 공간입니다.",
      images: [
        "/photos/web/lounge-002.webp",
        "/photos/web/lounge-001.webp",
        "/photos/web/lounge-004.webp",
        "/photos/web/lounge-005.webp",
        "/photos/web/lounge-006.webp",
        "/photos/web/lounge-007.webp",
        "/photos/web/lounge-003.webp"
      ]
    },
    {
      title: "기타시설",
      desc: "프린터, 싱크대, 커피머신 등 오래 머물기 편한 기본 시설을 갖췄습니다.",
      images: [
        "/photos/web/facilities-001.webp",
        "/photos/web/facilities-002.webp",
        "/photos/web/facilities-003.webp"
      ]
    },
    {
      title: "커뮤니티",
      desc: "각자의 일을 하다가도 가볍게 연결되고, 함께 몰입하는 장면들이 쌓입니다.",
      images: [
        "/photos/web/community-002.webp",
        "/photos/web/community-005.webp",
        "/photos/web/community-006.webp",
        "/photos/web/community-003.webp",
        "/photos/web/community-008.webp",
        "/photos/web/community-001.webp",
        "/photos/web/community-007.webp",
        "/photos/web/community-009.webp",
        "/photos/web/community-004.webp",
      ]
    }
  ],
  members: [
    "유튜버", "개발자", "디자이너", "영상PD", "브랜드 운영가", "작가", "번역가", "마케터"
  ],
  pricingProps: {
    disclaimer: "3개월 이상 계약 시 할인 혜택이 제공됩니다 · 모든 이용권 가격은 VAT 별도입니다."
  },
  // 12시간권 — 하루 체험 상품 (VAT 포함가, 네이버 예약)
  dayPass: {
    name: "12시간권",
    price: "13,900원",
    note: "VAT 포함 · 네이버 예약",
    desc: "하루만 집중해서 써보고 싶다면, 12시간권으로 가볍게 시작해 보세요."
  },
  dedicatedSeatPromo: {
    eyebrow: "Dedicated Desk",
    title: "전용석, 나만의 고정 자리 (잔여석은 문의 주세요)",
    description: "매번 자리 찾지 않아도 되는 나만의 고정 작업석이 필요하다면 전용석을 확인해보세요. 짐을 두고 다닐 수 있고, 24시간 언제든 바로 작업을 시작할 수 있습니다.",
    points: ["고정 좌석", "개인 서랍", "넓은 데스크", "24시간 이용"],
    cta: "전용석 문의하기"
  },
  pricing: [
    {
      type: "자유석",
      benefit: "기분에 따라 원하는 자리에서",
      price: "월 170,000원",
      period: "(장기 할인 있음)",
      buttonText: "이용권 문의하기",
      image: "/photos/web/free-seat-001.webp",
      galleryImages: [
        "/photos/web/free-seat-001.webp",
        "/photos/web/free-seat-003.webp",
        "/photos/web/free-seat-006.webp",
        "/photos/web/free-seat-008.webp",
        "/photos/web/free-seat-007.webp",
        "/photos/web/free-seat-004.webp",
        "/photos/web/free-seat-005.webp",
        "/photos/web/free-seat-011.webp",
        "/photos/web/free-seat-009.webp",
        "/photos/web/free-seat-010.webp",
        "/photos/web/free-seat-002.webp"
      ],
      descriptionTitle: "오늘은 햇살 좋은 창가에서,\n내일은 넓은 테이블에서.",
      descriptionBody: "창가 자리, 긴 테이블, 개인 데스크를 그날 컨디션에 맞춰 오가며 쓰는 좌석입니다. 노트북만 들고 와도 오래 앉아 일하기 편하게 준비되어 있어요.",
      practicalInfo: [
        { label: "추천", text: "카페보다 편하게 오래 일하고 싶은 분" },
        { label: "출입", text: "입주자분들께 전용 어플 사용 방법을 안내드립니다." },
        { label: "포함", text: "데스크, 포커스 체어, 콘센트, 와이파이, 커피와 간식" }
      ],
      periods: [
        { label: "1개월", price: "170,000원" },
        { label: "3개월", price: "160,000원", tag: "인기" },
        { label: "6개월", price: "150,000원" },
        { label: "12개월", price: "140,000원", tag: "최대할인" }
      ],
      details: [
        {
          emoji: "💻",
          title: "카페 테이블과는 다릅니다",
          text: "흔들림 없는 데스커 1000*600 노트북 데스크가 준비되어 있습니다. 커피 잔을 놓고 마우스를 움직여도 넉넉한 공간에서 쾌적하게 작업하세요."
        },
        {
          emoji: "🪑",
          title: "허리 아픈 나무 의자는 안녕",
          text: "자유석에도 오래 앉기 편한 포커스 체어(Focus Chair)를 두었습니다. 카페 의자가 불편했던 분들이 차이를 바로 느끼실 거예요."
        },
        {
          emoji: "☕️",
          title: "취향대로 고르는 업무 존",
          text: "혼자 조용히 앉고 싶을 때는 개인 데스크에, 조금 트인 자리가 필요할 때는 긴 테이블에 앉아보세요."
        }
      ],
      features: [
        "어디든 앉을 수 있는 오픈 좌석",
        "집중을 돕는 잔잔한 작업 분위기",
        "커피와 간식, 부담 없이",
        "가끔은 이어지는 대화와 커뮤니티"
      ]
    },
    {
      type: "전용석",
      benefit: "이제는 내 자리 하나쯤",
      price: "월 320,000원",
      period: "(장기 할인 있음)",
      buttonText: "이용권 문의하기",
      image: "/photos/web/dedicated-seat-004.webp",
      galleryImages: [
        "/photos/web/dedicated-seat-004.webp",
        "/photos/web/dedicated-seat-002.webp",
        "/photos/web/dedicated-seat-001.webp",
        "/photos/web/dedicated-seat-005.webp",
        "/photos/web/dedicated-seat-003.webp"
      ],
      descriptionTitle: "매일 아침, 좋은 자리를 찾아\n헤맬 필요 없어요.",
      descriptionBody: "개인 데스크와 의자, 조명, 서랍을 고정으로 쓰는 좌석입니다. 장비를 두고 다니고, 출근하듯 바로 일을 시작하고 싶은 분께 잘 맞습니다.",
      practicalInfo: [
        { label: "추천", text: "고정 자리와 개인 장비 보관이 필요한 분" },
        { label: "출입", text: "입주자분들께 전용 어플 사용 방법을 안내드립니다." },
        { label: "포함", text: "1400 데스크, 시디즈 의자, 개인 조명, 서랍, 멀티탭" }
      ],
      periods: [
        { label: "1개월", price: "320,000원" },
        { label: "3개월", price: "310,000원" },
        { label: "6개월", price: "290,000원", tag: "추천" },
        { label: "12개월", price: "270,000원", tag: "최대할인" }
      ],
      details: [
        {
          emoji: "🪑",
          title: "내 몸에 맞춘 듯한 편안함",
          text: "시디즈 T20 의자와 데스커 1400*700 데스크를 사용합니다. 모니터와 노트북을 함께 올려도 여유가 있습니다."
        },
        {
          emoji: "💡",
          title: "나만의 아늑한 베이스캠프",
          text: "적당한 높이의 수납 파티션은 답답하지 않게 시선을 차단해 아늑함을 주고, 개인 조명은 오직 내 책상 위만 환하게 비춰 몰입도를 높여줍니다."
        },
        {
          emoji: "🔒",
          title: "짐은 두고 몸만 오세요",
          text: "매일 쓰는 무거운 장비와 개인 물품은 개인 서랍(잠금장치 O)에 안전하게 보관하세요. 넉넉한 개인 멀티탭까지 세팅되어 있어, 자리에 앉는 순간 바로 업무 모드가 시작됩니다."
        }
      ],
      features: [
        "나만의 고정 좌석",
        "짐을 두고 다닐 수 있는 편안함",
        "언제든 들어와 바로 일할 수 있는 환경",
        "조금 더 깊게 연결되는 커뮤니티"
      ]
    },
    {
      type: "비상주 사무실",
      benefit: "사업자 주소가 필요할 때",
      price: "180,000~",
      period: "/6개월",
      priceSuffix: " (총액)",
      buttonText: "비상주 문의하기",
      image: "/photos/web/community-001.webp",
      galleryImages: [
        "/photos/web/community-001.webp",
        "/photos/web/community-003.webp"
      ],
      descriptionTitle: "김포 운양동 주소로\n사업자등록을 시작하세요.",
      descriptionBody: "자리를 쓰지 않고 사업자 주소지와 우편물 수령만 필요한 분을 위한 비상주 사무실입니다. 예비창업자, 온라인 셀러, 1인 사업자분들이 김포 비상주 사무실로 이용하고 있어요.",
      practicalInfo: [
        { label: "추천", text: "사업자등록 주소지와 우편물 관리가 필요한 1인 사업자·온라인 셀러" },
        { label: "포함", text: "사업자 주소지 등록, 우편물·택배 수령 및 알림" },
        { label: "안내", text: "좌석 이용은 포함되지 않으며, 회의실은 별도 요금으로 이용할 수 있습니다." }
      ],
      periods: [
        { label: "6개월", price: "180,000원" },
        { label: "12개월", price: "240,000원", tag: "최대할인" }
      ],
      details: [
        {
          emoji: "📮",
          title: "우편물은 저희가 받아드려요",
          text: "등기와 택배가 도착하면 바로 알려드립니다. 필요할 때 방문해서 찾아가시면 됩니다."
        },
        {
          emoji: "🏢",
          title: "운양역 1분, 김포한강1로 주소",
          text: "김포 운양동 중심 상권의 주소를 사업자등록 소재지로 사용하실 수 있습니다."
        },
        {
          emoji: "🪑",
          title: "필요하면 자리도, 회의실도",
          text: "미팅이 잡히면 회의실을 시간 단위로, 작업이 필요한 날은 자유석 12시간권으로 함께 이용할 수 있어요."
        }
      ],
      features: [
        "사업자등록용 주소 제공",
        "우편물·택배 수령 알림",
        "6개월·12개월 단위 계약",
        "회의실·자유석 추가 이용 가능"
      ]
    },
    {
      type: "휴게 라운지",
      benefit: "쉼이 있는 몰입을 위해",
      price: "FREE",
      period: " (멤버 전용)",
      buttonText: "공간 문의하기",
      image: "/photos/web/lounge-002.webp",
      galleryImages: [
        "/photos/web/lounge-002.webp",
        "/photos/web/lounge-001.webp",
        "/photos/web/lounge-004.webp",
        "/photos/web/lounge-005.webp",
        "/photos/web/lounge-006.webp",
        "/photos/web/lounge-007.webp",
        "/photos/web/lounge-003.webp"
      ],
      descriptionTitle: "일하다가 잠깐 쉬고 싶을 때",
      descriptionBody: "커피를 마시거나 잠깐 쉬고 싶을 때 쓰는 멤버 전용 공용 공간입니다. 간단한 간식이나 식사도 이곳에서 편하게 할 수 있어요.",
      practicalInfo: [
        { label: "이용", text: "오디워크룸 입주 멤버 전용" },
        { label: "포함", text: "소파, 커피와 차, 간식, 냉장고" },
        { label: "안내", text: "냄새가 강하지 않은 간단한 음식 위주로 이용해 주세요." }
      ],
      details: [
        {
          emoji: "🌊",
          title: "한강뷰 라운지 & 빈백 소파",
          text: "답답한 책상을 벗어나 탁 트인 창밖 풍경을 마주해보세요. 잠깐의 낮잠이나 독서가 필요할 땐 몸을 푹신하게 감싸주는 빈백 소파가 기다리고 있습니다."
        },
        {
          emoji: "🍱",
          title: "가벼운 식사와 간식",
          text: "너무 냄새나지 않는 간단한 음식은 라운지에서 편하게 드실 수 있습니다. 냉장고가 있어 음료나 간식을 잠시 보관하기 좋습니다."
        },
        {
          emoji: "☕️",
          title: "무제한 커피와 스낵",
          text: "입주자 한정으로 제공되는 신선한 원두커피와 제철 간식이 준비되어 있습니다. 업무 중 당이 떨어지거나 진한 카페인이 필요할 때 언제든 자유롭게 이용하세요."
        }
      ],
      features: [
        "탁 트인 한강 조망권",
        "냄새 적은 음식 취식 가능",
        "릴렉스를 위한 빈백 구역",
        "커피/차/다과 무료 제공"
      ]
    }
  ],
  extraServices: [
    { name: "사물함", price: "월 20,000원", desc: "무거운 짐을 안전하게 보관하세요." },
    { name: "월주차", price: "월 33,000원", desc: "건물 주차장을 월 단위로 이용할 수 있습니다." },
    { name: "회의실 대여", price: "1시간 15,000원", desc: "입주 멤버는 1시간 10,000원" }
  ],
  community: {
    title: "가볍게 이어지는 커뮤니티",
    // action: 'apply' = 신청 모달 / 'insight' = 오디인사이트 아카이브로 이동 / 'none' = 소개만
    programs: [
      {
        name: "AI 커피챗",
        badge: "매월 첫째 주 금요일",
        desc: "한 달의 AI 소식을 같이 따라잡고, 각자의 작업에 써본 경험을 나누는 정기 모임이에요. 부담 없이 커피 한 잔과 함께해요.",
        action: "apply"
      },
      {
        name: "입주자 오픈채팅",
        badge: "상시",
        desc: "일 얘기, 동네 정보, 점심 메이트까지 — 입주하면 초대되는 채팅방이에요. 혼자 일해도 혼자가 아니게요.",
        action: "none"
      },
      {
        name: "연말 네트워킹",
        badge: "올해 12월",
        desc: "한 해를 마무리하며 입주자와 비상주 회원이 함께 모여요. 올해 12월, 첫 송년 모임이 열립니다.",
        action: "none"
      },
      {
        name: "오디인사이트 연재",
        badge: "매주 월요일",
        desc: "세금, 견적, 외주, 일하는 루틴 — 혼자 일하는 사람들을 위한 주간 카드뉴스를 연재하고 있어요.",
        action: "insight"
      }
    ]
  }
};
