export type Lang = 'en' | 'ko';

export const t = {
  en: {
    title: '_y Holdings',
    subtitle: 'Interactive AI Company Simulator',
    loading: 'Initializing _y Holdings...',
    headerTitle: 'Andrew Tower',
    headerSub: '_y Holdings HQ — 29 Agents Online',
    live: 'LIVE',
    rooftop: '_y HOLDINGS',
    entrance: '_y Holdings — Entrance',
    footer: '_y Holdings Interactive Company Simulator v1.0',
    // Floor labels
    floor: 'F',
    chairman: "Chairman's Office",
    lobby: 'Lobby',
    // Agent panel
    department: 'Department',
    role: 'Role',
    floorLabel: 'Floor',
    status: 'Status',
    working: 'Working',
    meeting: 'In Meeting',
    reporting: 'Reporting',
    idle: 'Idle',
    offline: 'Offline',
    active: 'Active',
    // Chat
    chatWith: 'Chat with',
    typeMessage: 'Type a message...',
    send: 'Send',
    thinking: 'Thinking...',
    chatError: 'Failed to get response. Please try again.',
    suggestedQuestions: 'Suggested questions:',
    // Dashboard
    companyOverview: 'Company Overview',
    agentsWorking: 'Agents Working',
    inMeeting: 'In Meeting',
    inElevator: 'In Elevator',
    reportingTo: 'Reporting to Chairman',
    departmentStatus: 'Department Status',
    recentActivity: 'Recent Activity',
    // Activity
    activityFeed: 'Activity Feed',
    // Navigation
    scrollToFloor: 'Scroll to floor',
    // Sound
    soundOn: 'Sound On',
    soundOff: 'Sound Off',
  },
  ko: {
    title: '_y Holdings',
    subtitle: '인터랙티브 AI 회사 시뮬레이터',
    loading: '_y Holdings 초기화 중...',
    headerTitle: 'Andrew Tower',
    headerSub: '_y Holdings 본사 — 29명 에이전트 가동 중',
    live: '실시간',
    rooftop: '_y HOLDINGS',
    entrance: '_y Holdings — 정문',
    footer: '_y Holdings 인터랙티브 회사 시뮬레이터 v1.0',
    // Floor labels
    floor: '층',
    chairman: '회장실',
    lobby: '로비',
    // Agent panel
    department: '부서',
    role: '역할',
    floorLabel: '층',
    status: '상태',
    working: '업무 중',
    meeting: '회의 중',
    reporting: '보고 중',
    idle: '대기',
    offline: '오프라인',
    active: '활성',
    // Chat
    chatWith: '대화하기:',
    typeMessage: '메시지를 입력하세요...',
    send: '전송',
    thinking: '생각 중...',
    chatError: '응답을 받지 못했습니다. 다시 시도해주세요.',
    suggestedQuestions: '추천 질문:',
    // Dashboard
    companyOverview: '회사 현황',
    agentsWorking: '업무 중',
    inMeeting: '회의 중',
    inElevator: '이동 중',
    reportingTo: '회장 보고 중',
    departmentStatus: '부서별 현황',
    recentActivity: '최근 활동',
    // Activity
    activityFeed: '활동 피드',
    // Navigation
    scrollToFloor: '층 이동',
    // Sound
    soundOn: '소리 켜짐',
    soundOff: '소리 꺼짐',
  },
} as const;
