import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, addDoc, query, onSnapshot, serverTimestamp, orderBy, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { MessageSquare, Smile, Heart, Users, Wind, Coffee, Phone, Calendar, AlertTriangle, Loader2, CornerDownRight, Video } from 'lucide-react';


// --- Configuração do Firebase ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-mental-health-app';

// --- Fontes do Google ---
const WebFont = ({ font }) => {
    useEffect(() => {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${font.replace(' ', '+')}:wght@400;700&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        return () => { document.head.removeChild(link); };
    }, [font]);
    return null;
};

// --- Componentes de Emojis em SVG ---
const HappyEmoji = () => (
    <svg viewBox="0 0 100 100" className="w-8 h-8">
        <circle cx="50" cy="50" r="45" fill="#fde047" />
        <circle cx="35" cy="40" r="5" fill="#4b5563" />
        <circle cx="65" cy="40" r="5" fill="#4b5563" />
        <path d="M 30 65 Q 50 80, 70 65" stroke="#4b5563" strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
);
const CalmEmoji = () => (
    <svg viewBox="0 0 100 100" className="w-8 h-8">
        <circle cx="50" cy="50" r="45" fill="#a5f3fc" />
        <path d="M 30 45 Q 40 50, 45 45" stroke="#4b5563" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M 55 45 Q 65 50, 70 45" stroke="#4b5563" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M 35 65 L 65 65" stroke="#4b5563" strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
);
const NeutralEmoji = () => (
    <svg viewBox="0 0 100 100" className="w-8 h-8">
        <circle cx="50" cy="50" r="45" fill="#fef08a" />
        <circle cx="35" cy="45" r="5" fill="#4b5563" />
        <circle cx="65" cy="45" r="5" fill="#4b5563" />
        <line x1="35" y1="70" x2="65" y2="70" stroke="#4b5563" strokeWidth="5" strokeLinecap="round" />
    </svg>
);
const AnxiousEmoji = () => (
    <svg viewBox="0 0 100 100" className="w-8 h-8">
        <circle cx="50" cy="50" r="45" fill="#d8b4fe" />
        <circle cx="35" cy="45" r="5" fill="#4b5563" />
        <circle cx="65" cy="45" r="5" fill="#4b5563" />
        <path d="M 30 70 Q 50 60, 70 70" stroke="#4b5563" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M 20 30 C 25 20, 35 20, 40 30" stroke="#38bdf8" fill="none" strokeWidth="4" strokeLinecap="round"/>
    </svg>
);
const SadEmoji = () => (
    <svg viewBox="0 0 100 100" className="w-8 h-8">
        <circle cx="50" cy="50" r="45" fill="#a5b4fc" />
        <circle cx="35" cy="45" r="5" fill="#4b5563" />
        <circle cx="65" cy="45" r="5" fill="#4b5563" />
        <path d="M 30 75 Q 50 60, 70 75" stroke="#4b5563" strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
);
const StressedEmoji = () => (
    <svg viewBox="0 0 100 100" className="w-8 h-8">
        <circle cx="50" cy="50" r="45" fill="#fb7185" />
        <path d="M 30 40 L 40 50 M 40 40 L 30 50" stroke="#4b5563" strokeWidth="5" strokeLinecap="round" />
        <path d="M 60 40 L 70 50 M 70 40 L 60 50" stroke="#4b5563" strokeWidth="5" strokeLinecap="round" />
        <path d="M 25 75 L 75 65" stroke="#4b5563" strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
);

const moodComponents = {
    'Feliz': HappyEmoji,
    'Calmo': CalmEmoji,
    'Normal': NeutralEmoji,
    'Ansioso': AnxiousEmoji,
    'Triste': SadEmoji,
    'Estressado': StressedEmoji,
};

// --- Componentes da UI ---

const Navbar = ({ page, setPage }) => {
    const navItems = [
        { id: 'home', label: 'Início' },
        { id: 'checkin', label: 'Meu Calendário' },
        { id: 'forum', label: 'Fórum' },
        { id: 'resources', label: 'Recursos' },
        { id: 'support', label: 'Apoio' },
    ];

    return (
        <nav className="bg-purple-50/80 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="flex items-center justify-between h-16 relative z-10">
                    <div className="flex items-center cursor-pointer" onClick={() => setPage('home')}>
  <img src={logo} alt="Logo UnBem" className="w-10 h-10 mr-2" />
  <div className="text-4xl font-bold" style={{ fontFamily: "'Caveat', cursive" }}>
    <span style={{ color: '#a78bfa' }}>Un</span>
    <span style={{ color: '#84cc16' }}>Bem</span>
  </div>
</div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setPage(item.id)}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                        page === item.id ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-purple-100 hover:text-purple-700'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

const HomePage = ({ setPage }) => (
    <div className="text-center py-16">
        <h1 className="text-5xl md:text-6xl font-bold text-slate-800 tracking-tight" style={{fontFamily: "'Caveat', cursive"}}>
            Um lugar de <span className="text-purple-500">bem-estar</span> na sua jornada acadêmica
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
            Acompanhe seu humor com nosso calendário emocional e acesse um fórum anônimo para se conectar com outros estudantes.
        </p>
        <button onClick={() => setPage('checkin')} className="mt-8 bg-purple-500 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-purple-600 transition-colors">
            Comece a Usar
        </button>
    </div>
);

const CheckinPage = ({ setPage }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [moodsData, setMoodsData] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [showSupportAlert, setShowSupportAlert] = useState(false);

    const moods = [
        { name: 'Feliz', Emoji: HappyEmoji, type: 'positive' },
        { name: 'Calmo', Emoji: CalmEmoji, type: 'positive' },
        { name: 'Normal', Emoji: NeutralEmoji, type: 'neutral' },
        { name: 'Ansioso', Emoji: AnxiousEmoji, type: 'negative' },
        { name: 'Triste', Emoji: SadEmoji, type: 'negative' },
        { name: 'Estressado', Emoji: StressedEmoji, type: 'negative' },
    ];

    useEffect(() => {
        try {
            const savedMoods = localStorage.getItem('unbemMoods');
            const allMoods = savedMoods ? JSON.parse(savedMoods) : {};
            setMoodsData(allMoods);
            checkNegativeStreak(allMoods);
        } catch (error) {
            console.error("Failed to parse moods from localStorage", error);
            setMoodsData({});
        }
    }, [currentDate]);

    const checkNegativeStreak = (data) => {
        const monthYearKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
        const negativeCount = Object.keys(data).filter(key => key.startsWith(monthYearKey))
                                .map(key => data[key])
                                .filter(mood => mood.type === 'negative').length;
        setShowSupportAlert(negativeCount >= 5);
    };

    const handleSetMood = async (mood) => {
        if (!selectedDate) return;
        const dayKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
        
        try {
            const savedMoods = localStorage.getItem('unbemMoods');
            const allMoods = savedMoods ? JSON.parse(savedMoods) : {};
            const updatedMoods = { ...allMoods, [dayKey]: {name: mood.name, type: mood.type} };
            
            localStorage.setItem('unbemMoods', JSON.stringify(updatedMoods));
            setMoodsData(updatedMoods);
            checkNegativeStreak(updatedMoods);
            setSelectedDate(null);
        } catch (error) {
            console.error("Failed to save mood to localStorage", error);
        }
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days = [];

        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="border rounded-md p-2 h-24"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${year}-${month}-${day}`;
            const moodData = moodsData[dateKey];
            const MoodComponent = moodData ? moodComponents[moodData.name] : null;
            days.push(
                <div key={day} className="border rounded-md p-2 h-24 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-100 transition-colors" onClick={() => setSelectedDate(new Date(year, month, day))}>
                    <span className="font-bold self-start">{day}</span>
                    {MoodComponent && (
                        <div className="flex-grow flex items-center justify-center">
                           <MoodComponent />
                        </div>
                    )}
                </div>
            );
        }
        return days;
    };

    const changeMonth = (offset) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    return (
        <div>
            {showSupportAlert && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 flex items-center justify-between">
                    <div>
                        <p className="font-bold">Estamos aqui para você</p>
                        <p>Notamos que você registrou vários dias difíceis. Lembre-se que não há problema em não estar bem. Se precisar, nossa página de apoio tem recursos que podem ajudar.</p>
                    </div>
                    <button onClick={() => setPage('support')} className="bg-red-500 text-white font-bold py-1 px-3 rounded hover:bg-red-600">Ver Apoio</button>
                </div>
            )}
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-md hover:bg-purple-100">&lt; Anterior</button>
                <h2 className="text-2xl font-bold text-slate-700">{currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-md hover:bg-purple-100">Próximo &gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-2">
                {renderCalendar()}
            </div>
            {selectedDate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4 text-center">Como você se sentiu em {selectedDate.toLocaleDateString('pt-BR')}?</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {moods.map(mood => (
                                <button key={mood.name} onClick={() => handleSetMood(mood)} className={`p-3 rounded-lg text-slate-800 font-bold flex flex-col items-center justify-center space-y-2 transition-transform hover:scale-105`}>
                                    <mood.Emoji />
                                    <span>{mood.name}</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setSelectedDate(null)} className="mt-6 w-full text-center text-sm text-slate-500 hover:text-slate-800">Cancelar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const ForumPage = ({ db }) => {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const bottomOfChat = useRef(null);

    useEffect(() => {
        if (!db) {
            setError("A conexão com o banco de dados não está pronta. O fórum pode não funcionar.");
            setIsLoading(false);
            return;
        }
        const postsCollectionPath = `/artifacts/${appId}/public/data/posts`;
        const q = query(collection(db, postsCollectionPath), orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPosts(postsData);
            setIsLoading(false);
        }, (err) => {
            console.error("Erro ao buscar posts: ", err);
            setError("Não foi possível carregar os posts. Tente recarregar a página.");
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [db]);
    
    useEffect(() => {
        bottomOfChat.current?.scrollIntoView({ behavior: 'smooth' });
    }, [posts]);

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (newPost.trim() === '' || !db) return;
        try {
            const postsCollectionPath = `/artifacts/${appId}/public/data/posts`;
            await addDoc(collection(db, postsCollectionPath), {
                text: newPost,
                createdAt: serverTimestamp(),
            });
            setNewPost('');
        } catch (err) {
            console.error("Erro ao adicionar post: ", err);
            setError("Ocorreu um erro ao enviar seu desabafo.");
        }
    };
    
    const PostItem = ({ post, db }) => {
        const [replies, setReplies] = useState([]);
        const [showReplyInput, setShowReplyInput] = useState(false);
        const [replyText, setReplyText] = useState('');

        useEffect(() => {
            if (!db) return;
            const repliesPath = `/artifacts/${appId}/public/data/posts/${post.id}/replies`;
            const q = query(collection(db, repliesPath), orderBy('createdAt', 'asc'));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                setReplies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            });
            return () => unsubscribe();
        }, [db, post.id]);

        const handleReplySubmit = async (e) => {
            e.preventDefault();
            if (replyText.trim() === '' || !db) return;
            const repliesPath = `/artifacts/${appId}/public/data/posts/${post.id}/replies`;
            await addDoc(collection(db, repliesPath), {
                text: replyText,
                createdAt: serverTimestamp()
            });
            setReplyText('');
            setShowReplyInput(false);
        };
        
        return (
            <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col border border-slate-200">
                <p className="text-slate-800 flex-grow">{post.text}</p>
                <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-slate-400">
                        {post.createdAt?.toDate().toLocaleString('pt-BR') || 'Enviando...'}
                    </p>
                    <button onClick={() => setShowReplyInput(!showReplyInput)} className="flex items-center text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors">
                        <CornerDownRight className="w-4 h-4 mr-1" />
                        Responder
                    </button>
                </div>
                <div className="mt-3 pl-4 border-l-2 border-purple-200 space-y-2">
                    {replies.map(reply => (
                        <div key={reply.id} className="bg-purple-50 p-2 rounded-md">
                            <p className="text-sm text-slate-700">{reply.text}</p>
                            <p className="text-xs text-slate-400 text-right mt-1">{reply.createdAt?.toDate().toLocaleString('pt-BR')}</p>
                        </div>
                    ))}
                </div>
                {showReplyInput && (
                    <form onSubmit={handleReplySubmit} className="mt-3 pl-4">
                        <textarea 
                            value={replyText} 
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition"
                            rows="2"
                            placeholder="Escreva sua resposta de apoio..."
                        />
                        <div className="flex items-center justify-end mt-2">
                            <button type="submit" className="bg-purple-500 text-white font-bold py-1 px-3 text-xs rounded-lg hover:bg-purple-600 transition-colors">
                                Enviar Resposta
                            </button>
                        </div>
                    </form>
                )}
            </div>
        );
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4 text-center">Fórum de Desabafos Anônimos</h2>
            <p className="text-center text-slate-600 mb-6">Este é um espaço seguro. Inicie um desabafo ou responda a um colega para oferecer apoio.</p>
            <div className="bg-green-50 rounded-lg shadow-inner p-4 h-[50vh] overflow-y-auto flex flex-col space-y-4">
                {isLoading && <p className="text-center text-slate-500">Carregando desabafos...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}
                {!isLoading && posts.length === 0 && <p className="text-center text-slate-500">Ainda não há desabafos. Seja o primeiro!</p>}
                {posts.map(post => <PostItem key={post.id} post={post} db={db} />)}
                 <div ref={bottomOfChat} />
            </div>
            <form onSubmit={handlePostSubmit} className="mt-6">
                <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                    rows="3"
                    placeholder="Escreva um novo desabafo aqui..."
                ></textarea>
                <button type="submit" className="mt-2 w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors duration-300">
                    Publicar Novo Desabafo
                </button>
            </form>
        </div>
    );
};

const ResourcesPage = () => {
    const resources = [
        { 
            icon: Wind, 
            title: 'Técnicas de Respiração e Como Controlar Crises', 
            description: 'Aprenda a controlar a ansiedade e a focar no presente com exercícios simples de respiração.',
            links: [
                { url: 'https://youtu.be/90tpylJ_K-U?si=6pxog2FjRT6teui5', text: 'Vídeo 1: Respiração Diafragmática para Ansiedade' },
                { url: 'https://youtu.be/8YG8HABY25w?si=3CqC4aBik1efG-dj', text: 'Vídeo 2: Meditação Guiada para Acalmar a Mente' }
            ]
        },
        { 
            icon: Video, 
            title: 'Vídeos Inspiradores', 
            description: 'Encontre motivação e novas perspectivas com estes vídeos selecionados.',
            links: [
                { url: 'https://youtu.be/VdZI5gMS9nM?si=TCHAMGqVsv0AsCH-', text: 'Vídeo: Abrace a vulnerabilidade' },
                { url: 'https://youtu.be/z4plH2K2uHY?si=TjoabAElK7JQmD--', text: 'Vídeo: O poder da mente' },
                { url: 'https://youtu.be/Fb5IzFx2MDk?si=iLwPu20fFyrdkmd3', text: 'Vídeo: Para quem se sente perdido' }
            ]
        },
        { 
            icon: Heart, 
            title: 'Mindfulness e Meditação', 
            description: 'Práticas guiadas para acalmar a mente, reduzir o estresse e aumentar a concentração nos estudos.',
            links: [
                { url: 'https://youtu.be/rVTqBPop4LA?si=auL3dZXFqEkCaYTI', text: 'Meditação Guiada para Iniciantes' },
                { url: 'https://youtu.be/w306WAzow3s?si=YoMWHC_QxaZ5zi0y', text: 'Meditação para Foco e Concentração' },
                { url: 'https://youtu.be/zPvuphuFWS0?si=1aLg8PLi5A-bFXCt', text: 'Meditação para Dormir Profundamente' },
                { url: 'https://youtu.be/QJ6j77GjdFQ?si=408R0N5jWzt7Oqfz', text: 'Meditação para Aliviar a Ansiedade' }
            ]
        },
        { 
            icon: Coffee, 
            title: 'Dicas de Rotina Saudável', 
            description: 'Como organizar seus estudos, sono e lazer para um maior bem-estar e produtividade.',
            links: [
                { url: 'https://multivix.edu.br/blog/higiene-do-sono/', text: 'Artigo: Higiene do Sono' },
                { url: 'https://www.essentialnutrition.com.br/conteudos/rotina-saudavel-e-produtiva/', text: 'Artigo: Rotina Saudável e Produtiva' }
            ]
        },
    ];
    return (
        <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Recursos de Autocuidado</h2>
            <p className="text-slate-600 mb-8">Pequenas práticas diárias que fazem uma grande diferença.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {resources.map(r => (
                    <div key={r.title} className="bg-white p-6 rounded-xl shadow-lg text-left border-2 border-transparent hover:border-purple-200 transition-colors flex flex-col">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                           <r.icon className="h-6 w-6 text-purple-500" />
                        </div>
                        <h3 className="font-bold text-xl text-slate-800 mt-4">{r.title}</h3>
                        <p className="mt-2 text-slate-600 flex-grow">{r.description}</p>
                        {r.links && (
                            <div className="mt-4 pt-4 border-t border-purple-100">
                                <h4 className="font-bold text-sm text-slate-700 mb-2">Links úteis:</h4>
                                <ul className="space-y-2">
                                    {r.links.map(link => (
                                        <li key={link.url}>
                                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline text-sm">
                                                {link.text}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const SupportPage = () => (
    <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Direcionamento para Apoio Emocional</h2>
        <p className="text-slate-600 mb-8 max-w-3xl mx-auto">Se você precisa de ajuda, não hesite em procurar. Você não está sozinho. Abaixo estão alguns recursos importantes.</p>
        <div className="space-y-8 text-left max-w-2xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-lime-200">
                <div className="flex items-center">
                    <Phone className="h-8 w-8 text-lime-500 mr-4"/>
                    <div>
                        <h3 className="font-bold text-xl text-slate-800">CVV - Centro de Valorização da Vida</h3>
                        <p className="text-slate-600">Apoio emocional e prevenção do suicídio, gratuito e sigiloso.</p>
                    </div>
                </div>
                <div className="mt-4">
                    <p className="font-semibold">Ligue: <a href="tel:188" className="text-purple-600 hover:underline">188</a> (ligação gratuita)</p>
                    <p className="font-semibold">Site: <a href="https://www.cvv.org.br" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">www.cvv.org.br</a> (chat online)</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-purple-200">
                 <div className="flex items-center">
                    <Users className="h-8 w-8 text-purple-500 mr-4"/>
                    <div>
                        <h3 className="font-bold text-xl text-slate-800">Apoio Psicológico da UnB (CAEP)</h3>
                        <p className="text-slate-600">A Diretoria de Atenção à Saúde da Comunidade Universitária (DASU/DAC) oferece, através da CAEP, atendimento psicológico para a comunidade acadêmica.</p>
                    </div>
                 </div>
                 <div className="mt-4">
                    <p className="font-semibold">
                        <a href="http://www.caep.unb.br/servicos-oferecidos/atendimento-psicologico" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Acesse o site da CAEP para mais informações</a>
                    </p>
                </div>
            </div>
        </div>
    </div>
);


// --- Componente Principal da Aplicação ---

export default function App() {
    const [page, setPage] = useState('home');
    const [db, setDb] = useState(null);
    const [isFirebaseReady, setIsFirebaseReady] = useState(false);

    useEffect(() => {
        if (Object.keys(firebaseConfig).length > 0) {
            try {
                const app = initializeApp(firebaseConfig);
                const firestoreDb = getFirestore(app);
                const authInstance = getAuth(app);
                setDb(firestoreDb);
                
                // Sign in anonymously for forum access
                signInAnonymously(authInstance).catch((error) => {
                    console.error("Anonymous sign-in failed:", error);
                });

                setIsFirebaseReady(true);
            } catch (error) {
                console.error("Firebase initialization failed:", error);
                setIsFirebaseReady(true); // Still allow app to run without forum
            }
        } else {
            setIsFirebaseReady(true);
        }
    }, []);

    const renderPage = () => {
        if (!isFirebaseReady) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin h-8 w-8 text-purple-500" />
                </div>
            );
        }

        switch (page) {
            case 'forum':
                return <ForumPage db={db} />;
            case 'checkin':
                return <CheckinPage setPage={setPage} />;
            case 'resources':
                return <ResourcesPage />;
            case 'support':
                return <SupportPage />;
            default:
                return <HomePage setPage={setPage} />;
        }
    };

    return (
        <>
            <WebFont font="Poppins" />
            <WebFont font="Caveat" />
            <div className="bg-green-50 min-h-screen font-sans">
                <Navbar page={page} setPage={setPage} />
                <main className="pt-24 pb-12">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        {renderPage()}
                    </div>
                </main>
            </div>
        </>
    );
}
