import { useEffect, useState } from 'react';

interface ProxyItemMTPROTO {
  host: string;
  port: number;
  secret: string;
  country: string;
}

interface ProxyItemSOCKS5 {
  ip: string;
  port: number;
  country: string;
  ping: number;
}

type ProxyItem = ProxyItemMTPROTO | ProxyItemSOCKS5;

const PER_PAGE = 6;
const API_URL_MTPROTO = 'https://mtpro.xyz/api/?type=mtproto';
const API_URL_SOCKS = 'https://mtpro.xyz/api/?type=socks';

export default function Home() {
  const [tab, setTab] = useState<'MTPROTO' | 'SOCKS5'>('MTPROTO');
  const [proxiesMTPROTO, setProxiesMTPROTO] = useState<ProxyItemMTPROTO[]>([]);
  const [proxiesSOCKS, setProxiesSOCKS] = useState<ProxyItemSOCKS5[]>([]);
  const [filtered, setFiltered] = useState<ProxyItem[]>([]);
  const [currentCountry, setCurrentCountry] = useState('ALL');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [countries, setCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProxies();
  }, [tab]);

  const fetchProxies = async () => {
    const url = tab === 'MTPROTO' ? API_URL_MTPROTO : API_URL_SOCKS;
    setLoading(true);
    try {
      const res = await fetch(url);
      const data = await res.json();

      if (tab === 'MTPROTO') {
        const list = data as ProxyItemMTPROTO[];
        setProxiesMTPROTO(list);
        setCountries([...new Set(list.map(p => p.country.toUpperCase()))].sort());
        applyFilter('ALL', list);
      } else {
        const list = data as ProxyItemSOCKS5[];
        setProxiesSOCKS(list);
        setCountries([...new Set(list.map(p => p.country.toUpperCase()))].sort());
        applyFilter('ALL', list);
      }
    } catch (err) {
      console.error(err);
      alert('Không thể tải dữ liệu proxy!');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (
    countryCode: string,
    list: ProxyItem[] = tab === 'MTPROTO' ? proxiesMTPROTO : proxiesSOCKS
  ) => {
    setCurrentCountry(countryCode);
    setCurrentIndex(0);
    const filteredList =
      countryCode === 'ALL'
        ? list
        : list.filter(p => p.country.toUpperCase() === countryCode);
    setFiltered(filteredList);
  };

  const showMoreProxies = () => {
    setCurrentIndex(prev => prev + PER_PAGE);
  };

  const visibleProxies = filtered.slice(0, currentIndex + PER_PAGE);

  // Type guard
  const isMTPROTO = (proxy: ProxyItem): proxy is ProxyItemMTPROTO => {
    return (proxy as ProxyItemMTPROTO).secret !== undefined;
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-6 shadow-md">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center">Danh sách Proxy Telegram</h1>
        </div>
      </header>

      <main className="py-10 px-4 max-w-6xl mx-auto">
        {/* Tabs */}
        <div className="flex justify-center mb-8 gap-4">
          {['MTPROTO', 'SOCKS5'].map(type => (
            <button
              key={type}
              onClick={() => setTab(type as 'MTPROTO' | 'SOCKS5')}
              className={`px-6 py-2 rounded-full font-medium shadow-md transition ${
                tab === type
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-800 border border-gray-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              currentCountry === 'ALL'
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-300 text-gray-800'
            }`}
            onClick={() => applyFilter('ALL')}
          >
            Tất cả
          </button>

          {countries.map(code => (
            <button
              key={code}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                currentCountry === code
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-800'
              }`}
              onClick={() => applyFilter(code)}
            >
              <img
                alt={code}
                src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
                className="w-5 h-3 rounded border border-gray-300"
              />
              {code}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-10 text-gray-600">
            <span className="animate-pulse">Đang tải dữ liệu proxy...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {visibleProxies.map((proxy, index) => (
                <div
                  key={index}
                  className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
                >
                  <h3 className="text-lg font-semibold mb-2">
                    {tab} Proxy #{index + 1}
                  </h3>
                  <p className="text-sm mb-1">
                    <strong>Quốc gia:</strong> {proxy.country.toUpperCase()}
                  </p>
                  <p className="text-sm mb-1 break-all">
                    <strong>{isMTPROTO(proxy) ? 'Host' : 'IP'}:</strong>{' '}
                    {isMTPROTO(proxy) ? proxy.host : proxy.ip}
                  </p>
                  <p className="text-sm mb-1">
                    <strong>Port:</strong> {proxy.port}
                  </p>
                  {isMTPROTO(proxy) ? (
                    <a
                      href={`tg://proxy?server=${proxy.host}&port=${proxy.port}&secret=${proxy.secret}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block bg-indigo-600 text-white px-4 py-2 rounded-full text-sm hover:bg-indigo-500 transition"
                    >
                      Kết nối Telegram
                    </a>
                  ) : (
                    <>
                      <p className="text-sm mb-1">
                        <strong>Ping:</strong> {proxy.ping} ms
                      </p>
                      <a
                        href={`tg://socks?server=${proxy.ip}&port=${proxy.port}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block bg-indigo-600 text-white px-4 py-2 rounded-full text-sm hover:bg-indigo-500 transition"
                      >
                        Kết nối Telegram
                      </a>
                    </>
                  )}
                </div>
              ))}
            </div>

            {currentIndex + PER_PAGE < filtered.length && (
              <div className="text-center mt-10">
                <button
                  onClick={showMoreProxies}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-500 transition"
                >
                  Xem thêm Proxy
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-gray-200 py-6 mt-12 text-center text-sm text-gray-700">
        © {new Date().getFullYear()} Proxy Finder - Tìm proxy nhanh chóng cho Telegram.
      </footer>
    </div>
  );
}
