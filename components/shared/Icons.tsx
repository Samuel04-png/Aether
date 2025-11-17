import React from 'react';

const iconProps = {
  className: "w-6 h-6",
  strokeWidth: "1.5",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor"
};

export const DashboardIcon: React.FC = () => (
  <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
);
export const ChatIcon: React.FC = () => (
  <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.455.09-.934.09-1.423A7.927 7.927 0 003 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
);
export const SocialIcon: React.FC = () => (
  <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
);
export const WebsiteIcon: React.FC = () => (
  <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A11.953 11.953 0 0112 16.5c-2.998 0-5.74-1.1-7.843-2.918m15.686-7.832c.185.72.284 1.475.284 2.253" /></svg>
);
export const TasksIcon: React.FC = () => (
  <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
export const ProjectsIcon: React.FC = () => (
  <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>
);
export const LeadsIcon: React.FC = () => (
    <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962a3.75 3.75 0 015.908 0M18 18.72a9.094 9.094 0 01-7.5 0M12 12.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM3 13.5a9.094 9.094 0 017.5 0" /></svg>
);
export const SettingsIcon: React.FC = () => (
  <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.003 1.11-1.226.554-.223 1.197-.245 1.753.052l.47.195a2.25 2.25 0 011.082 1.082l.195.47a1.125 1.125 0 001.226 1.11l.542-.09a1.125 1.125 0 011.272.822l.328.981a1.125 1.125 0 01-.398 1.257l-.42.328a2.25 2.25 0 01-1.782.164l-.53-.162a1.125 1.125 0 00-1.226 1.11l.09.542a1.125 1.125 0 01-.822 1.272l-.981.328a1.125 1.125 0 01-1.257-.398l-.328-.42a2.25 2.25 0 01-.164-1.782l.162-.53a1.125 1.125 0 00-1.11-1.226l-.542.09a1.125 1.125 0 01-1.272-.822l-.328-.981a1.125 1.125 0 01.398-1.257l.42-.328a2.25 2.25 0 011.782-.164l.53.162a1.125 1.125 0 001.226-1.11l-.09-.542a1.125 1.125 0 01.822-1.272l.981-.328z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
export const SearchIcon: React.FC = () => (
    <svg {...iconProps} className="w-5 h-5 text-muted-foreground"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
);
export const BellIcon: React.FC = () => (
    <svg {...iconProps} className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
);
export const SparklesIcon: React.FC<{className?: string}> = ({className}) => (
    <svg {...iconProps} className={className || "w-5 h-5"} fill="currentColor" viewBox="0 0 24 24"><path d="M10,21.25A1.25,1.25,0,0,1,8.75,20V18.5A1.25,1.25,0,0,1,10,17.25h0A1.25,1.25,0,0,1,11.25,18.5V20A1.25,1.25,0,0,1,10,21.25ZM5.43,16.82a1.25,1.25,0,0,1-.88-2.13l1.06-1.06a1.25,1.25,0,0,1,1.77,1.77L6.31,16.31A1.25,1.25,0,0,1,5.43,16.82Zm13.14,0a1.25,1.25,0,0,1-.88-.36l-1.06-1.06a1.25,1.25,0,0,1,1.77-1.77l1.06,1.06a1.25,1.25,0,0,1-.88,2.13ZM10,7.25A1.25,1.25,0,0,1,8.75,6V4.5A1.25,1.25,0,0,1,10,3.25h0A1.25,1.25,0,0,1,11.25,4.5V6A1.25,1.25,0,0,1,10,7.25ZM12,14.25a2.5,2.5,0,0,1-1.77-4.27,2.5,2.5,0,0,1,3.54,3.54A2.5,2.5,0,0,1,12,14.25Zm8.75-2.25H18.5a1.25,1.25,0,0,1,0-2.5h2.25a1.25,1.25,0,0,1,0,2.5ZM3.25,12.25H5.5a1.25,1.25,0,0,1,0,2.5H3.25a1.25,1.25,0,0,1,0-2.5ZM18.57,7.43a1.25,1.25,0,0,1,.88.36l1.06,1.06a1.25,1.25,0,1,1-1.77,1.77L17.69,9.57a1.25,1.25,0,0,1,.88-2.13Zm-13.14,0a1.25,1.25,0,0,1,.88,2.13L5.25,10.62a1.25,1.25,0,0,1-1.77-1.77L4.54,7.79A1.25,1.25,0,0,1,5.43,7.43Z"/></svg>
);
export const ChevronLeftIcon: React.FC = () => (
    <svg {...iconProps} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
);
export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className || "w-4 h-4"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);
export const PlusIcon: React.FC = () => (
    <svg {...iconProps} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
);
export const CalendarIcon: React.FC = () => (
    <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" /></svg>
);
export const FileIcon: React.FC = () => (
    <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.165 12.223l.623 1.869A2.25 2.25 0 0110.125 18h3.75a2.25 2.25 0 012.25-2.25V6.105a2.25 2.25 0 00-2.25-2.25H8.25a2.25 2.25 0 00-2.25 2.25v8.313A2.25 2.25 0 006.9 18.25h.165z" /></svg>
);
export const UsersIcon: React.FC = () => (
    <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663M12 12.375a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" /></svg>
);
export const MessageIcon: React.FC = () => (
    <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.17 48.17 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
);
export const UploadIcon: React.FC = () => (
    <svg {...iconProps} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
);
export const GoogleIcon: React.FC = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.022,36.213,44,30.561,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
);
export const LogoutIcon: React.FC = () => (
    <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
);
export const CloseIcon: React.FC = () => (
    <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
);
export const MicIcon: React.FC = () => (
    <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>
);
export const CsvIcon: React.FC = () => (
    <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.188V18a2.25 2.25 0 002.25 2.25h3.839a2.25 2.25 0 002.08-1.573l.44-1.841M14.25 9.75L12 12m0 0l-2.25 2.25M12 12l2.25 2.25M12 12L9.75 9.75M15 3.75H9A2.25 2.25 0 006.75 6v12A2.25 2.25 0 009 20.25h1.5" /></svg>
);
export const CrmIcon: React.FC = () => (
    <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962a3.75 3.75 0 015.908 0M18 18.72a9.094 9.094 0 01-7.5 0M12 12.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM3 13.5a9.094 9.094 0 017.5 0m-1.5-3.375a3.75 3.75 0 115.908 0M3 21a5.25 5.25 0 005.25-5.25M15.75 21a5.25 5.25 0 01-5.25-5.25" /></svg>
);
export const CheckCircleIcon: React.FC = () => (
    <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
export const CheckIcon: React.FC<{className?: string}> = ({className}) => (
    <svg {...iconProps} className={className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
);
export const TrashIcon: React.FC<{className?: string}> = ({className}) => (
    <svg {...iconProps} className={className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
);
export const FilterIcon: React.FC<{className?: string}> = ({className}) => (
    <svg {...iconProps} className={className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" /></svg>
);
export const ClockIcon: React.FC<{className?: string}> = ({className}) => (
    <svg {...iconProps} className={className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
export const EnvelopeIcon: React.FC<{className?: string}> = ({className}) => (
    <svg {...iconProps} className={className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
);

export const PhoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 7.593 6.157 13.75 13.75 13.75h1.238a2.75 2.75 0 002.667-2.004l.57-2.07a1.25 1.25 0 00-.72-1.47l-3.02-1.208a1.25 1.25 0 00-1.403.36l-.87 1.09a10.97 10.97 0 01-4.74-4.74l1.09-.87a1.25 1.25 0 00.36-1.403L8.024 4.98a1.25 1.25 0 00-1.47-.72l-2.07.57A2.75 2.75 0 002.25 6.75z" />
  </svg>
);

export const MoreIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm7.5 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm7.5 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
  </svg>
);

export const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    {...iconProps}
    className={className || "w-6 h-6"}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7.5h16.5M3.75 12h16.5M3.75 16.5h16.5" />
  </svg>
);

export const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

export const ImageIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

export const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

export const AttachmentIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.75L12 19.125A4.5 4.5 0 116.636 13.5l6.364-6.375a3 3 0 114.243 4.243L10.5 18.136a1.5 1.5 0 11-2.121-2.121l5.657-5.679" />
  </svg>
);