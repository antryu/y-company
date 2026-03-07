export interface Agent {
  id: string;
  number: string;
  name: string;
  image: string;
  department: string;
  floor: number;
  role: string;
  status: 'working' | 'meeting' | 'idle';
}

export interface Floor {
  level: number;
  label: string;
  emoji: string;
  department: string;
  departmentEn: string;
  color: string;
  agents: Agent[];
}

const makeAgent = (
  num: string,
  name: string,
  dept: string,
  floor: number,
  role: string
): Agent => ({
  id: name.toLowerCase(),
  number: num,
  name,
  image: `/agents/${num}-${name.toLowerCase()}.png`,
  department: dept,
  floor,
  role,
  status: 'working',
});

export const floors: Floor[] = [
  {
    level: 10,
    label: '10F',
    emoji: '🏛️',
    department: '회장실',
    departmentEn: "Chairman's Office",
    color: '#FFD700',
    agents: [
      {
        id: 'andrew',
        number: '00',
        name: 'Andrew',
        image: '/agents/00-andrew.png',
        department: '회장실',
        floor: 10,
        role: 'Chairman & CEO',
        status: 'working',
      },
    ],
  },
  {
    level: 9,
    label: '9F',
    emoji: '📋',
    department: '기획조정실',
    departmentEn: 'Planning & Coordination',
    color: '#4A90D9',
    agents: [
      makeAgent('01', 'Tasky', '기획조정실', 9, 'Task Management'),
      makeAgent('02', 'Finy', '기획조정실', 9, 'Financial Planning'),
      makeAgent('03', 'Legaly', '기획조정실', 9, 'Legal Affairs'),
    ],
  },
  {
    level: 8,
    label: '8F',
    emoji: '🔴',
    department: '리스크챌린지실 / 감사실',
    departmentEn: 'Risk Challenge / Audit',
    color: '#E74C3C',
    agents: [
      makeAgent('04', 'Skepty', '리스크챌린지실', 8, 'Risk Analysis'),
      makeAgent('05', 'Audity', '감사실', 8, 'Auditing'),
    ],
  },
  {
    level: 7,
    label: '7F',
    emoji: '💻',
    department: 'SW개발본부',
    departmentEn: 'Software Development',
    color: '#2ECC71',
    agents: [
      makeAgent('06', 'Pixely', 'SW개발본부', 7, 'UI/UX Design'),
      makeAgent('07', 'Buildy', 'SW개발본부', 7, 'Full-stack Dev'),
      makeAgent('08', 'Testy', 'SW개발본부', 7, 'QA & Testing'),
    ],
  },
  {
    level: 6,
    label: '6F',
    emoji: '📺',
    department: '콘텐츠본부',
    departmentEn: 'Content Division',
    color: '#9B59B6',
    agents: [
      makeAgent('09', 'Buzzy', '콘텐츠본부', 6, 'Social Media'),
      makeAgent('10', 'Wordy', '콘텐츠본부', 6, 'Copywriting'),
      makeAgent('11', 'Edity', '콘텐츠본부', 6, 'Video Editing'),
      makeAgent('12', 'Searchy', '콘텐츠본부', 6, 'SEO & Research'),
    ],
  },
  {
    level: 5,
    label: '5F',
    emoji: '📈',
    department: '마케팅본부',
    departmentEn: 'Marketing Division',
    color: '#E67E22',
    agents: [
      makeAgent('13', 'Growthy', '마케팅본부', 5, 'Growth Hacking'),
      makeAgent('14', 'Logoy', '마케팅본부', 5, 'Brand Design'),
      makeAgent('15', 'Helpy', '마케팅본부', 5, 'Customer Support'),
      makeAgent('16', 'Clicky', '마케팅본부', 5, 'Ad Management'),
      makeAgent('17', 'Selly', '마케팅본부', 5, 'Sales Strategy'),
    ],
  },
  {
    level: 4,
    label: '4F',
    emoji: '🖥️',
    department: 'ICT본부',
    departmentEn: 'ICT Division',
    color: '#1ABC9C',
    agents: [
      makeAgent('18', 'Stacky', 'ICT본부', 4, 'Infrastructure'),
      makeAgent('19', 'Watchy', 'ICT본부', 4, 'Monitoring'),
      makeAgent('20', 'Guardy', 'ICT본부', 4, 'Security'),
    ],
  },
  {
    level: 3,
    label: '3F',
    emoji: '👥',
    department: '인사실',
    departmentEn: 'Human Resources',
    color: '#F39C12',
    agents: [
      makeAgent('21', 'Hiry', '인사실', 3, 'Recruiting'),
      makeAgent('22', 'Evaly', '인사실', 3, 'Evaluation'),
    ],
  },
  {
    level: 2,
    label: '2F',
    emoji: '💰',
    department: '_y Capital',
    departmentEn: '_y Capital',
    color: '#00D4AA',
    agents: [
      makeAgent('23', 'Quanty', '_y Capital', 2, 'Quantitative Analysis'),
      makeAgent('24', 'Tradey', '_y Capital', 2, 'Trading'),
      makeAgent('25', 'Globy', '_y Capital', 2, 'Global Markets'),
      makeAgent('26', 'Fieldy', '_y Capital', 2, 'Field Research'),
      makeAgent('27', 'Hedgy', '_y Capital', 2, 'Hedge Strategy'),
      makeAgent('28', 'Valuey', '_y Capital', 2, 'Valuation'),
    ],
  },
  {
    level: 1,
    label: '1F',
    emoji: '☁️',
    department: '_y SaaS / 로비',
    departmentEn: '_y SaaS / Lobby',
    color: '#3498DB',
    agents: [
      makeAgent('29', 'Opsy', '_y SaaS', 1, 'Operations'),
    ],
  },
];
