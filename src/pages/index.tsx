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

const PER_PAGE = 6;
const API_URL_MTPROTO = 'https://mtpro.xyz/api/?type=mtproto';
const API_URL_SOCKS = 'https://mtpro.xyz/api/?type=socks';

export default function Home() {
  const [tab, setTab] = useState<'MTPROTO' | 'SOCKS5'>('MTPROTO');
  const [proxiesMTPROTO, setProxiesMTPROTO] = useState<ProxyItemMTPROTO[]>([]);
  const [proxiesSOCKS, setProxiesSOCKS] = useState<ProxyItemSOCKS5[]>([]);
  const [filtered, setFiltered] = useState<(ProxyItemMTPROTO | ProxyItemSOCKS5)[]>([]);
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

  const applyFilter = (countryCode: string, list = tab === 'MTPROTO' ? proxiesMTPROTO : proxiesSOCKS) => {
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

  return (
    <div className="px-4 py-10 max-w-5xl mx-auto">
      <h2 className="text-3xl font-semibold text-center mb-8 text-white-800">
        Danh sách Proxy Telegram
      </h2>

      {/* Tabs */}
      <div className="flex justify-center mb-8 gap-4">
        <button
          onClick={() => setTab('MTPROTO')}
          className={`px-4 py-2 rounded border text-sm ${
            tab === 'MTPROTO' ? 'bg-gray-800 text-white' : 'bg-black text-gray-700 border-gray-300'
          }`}
        >
          MTPROTO
        </button>
        <button
          onClick={() => setTab('SOCKS5')}
          className={`px-4 py-2 rounded border text-sm ${
            tab === 'SOCKS5' ? 'bg-gray-800 text-white' : 'bg-black text-gray-700 border-gray-300'
          }`}
        >
          SOCKS5
        </button>
      </div>

      {/* Filter by Country */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <button
          className={`px-4 py-2 rounded border text-sm ${
            currentCountry === 'ALL'
              ? 'bg-gray-800 text-white'
              : 'bg-black text-gray-700 border-gray-300'
          }`}
          onClick={() => applyFilter('ALL')}
        >
          Tất cả
        </button>

        {countries.map(code => (
          <button
            key={code}
            className={`flex items-center gap-2 px-4 py-2 rounded border text-sm ${
              currentCountry === code
                ? 'bg-gray-800 text-white'
                : 'bg-black text-gray-700 border-gray-300'
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

      {/* Loading indicator */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <svg
              className="animate-spin h-5 w-5 text-gray-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            Đang tải dữ liệu proxy...
          </div>
        </div>
      ) : (
        <>
          {/* Proxy List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {visibleProxies.map((proxy, index) => (
              <div
                key={index}
                className="bg-white border rounded-lg shadow-sm hover:shadow-md transition p-5"
              >
                {tab === 'MTPROTO' ? (
                  <>
                    <h3 className="text-lg font-medium mb-3 text-gray-800">
                      MTPROTO Proxy #{index + 1}
                    </h3>
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">Quốc gia:</span> {(proxy as ProxyItemMTPROTO).country.toUpperCase()}
                    </p>
                    <p className="text-gray-600 mb-1 break-words whitespace-pre-line">
                      <span className="font-medium">Host:</span><br />
                      {(proxy as ProxyItemMTPROTO).host}
                    </p>
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">Port:</span> {(proxy as ProxyItemMTPROTO).port}
                    </p>
                    <a
                      href={`tg://proxy?server=${(proxy as ProxyItemMTPROTO).host}&port=${(proxy as ProxyItemMTPROTO).port}&secret=${(proxy as ProxyItemMTPROTO).secret}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block text-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition text-sm"
                    >
                      Kết nối Telegram
                    </a>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium mb-3 text-gray-800">
                      SOCKS5 Proxy #{index + 1}
                    </h3>
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">Quốc gia:</span> {(proxy as ProxyItemSOCKS5).country.toUpperCase()}
                    </p>
                    <p className="text-gray-600 mb-1 break-words whitespace-pre-line">
                      <span className="font-medium">IP:</span><br />
                      {(proxy as ProxyItemSOCKS5).ip}
                    </p>
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">Port:</span> {(proxy as ProxyItemSOCKS5).port}
                    </p>
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">Ping:</span> {(proxy as ProxyItemSOCKS5).ping} ms
                    </p>
                    <a
                      href={`tg://socks?server=${(proxy as ProxyItemSOCKS5).ip}&port=${(proxy as ProxyItemSOCKS5).port}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block text-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition text-sm"
                    >
                      Kết nối Telegram
                    </a>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Load More */}
          {currentIndex + PER_PAGE < filtered.length && (
            <div className="text-center mt-8">
              <button
                onClick={showMoreProxies}
                className="px-6 py-2 text-sm bg-gray-800 text-white rounded hover:bg-gray-700 transition"
              >
                Xem thêm Proxy
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
