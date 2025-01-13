import { Geist, Geist_Mono } from "next/font/google";
import { useCallback, useMemo, useState } from "react";
import { debounce } from 'lodash';
import { Analytics } from "@vercel/analytics/react"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function Home() {
  const [fileContent, setFileContent] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [lines, setLines] = useState<string[]>([]);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verificar se é um arquivo .txt
    if (file.type !== "text/plain") {
      alert("Por favor, selecione um arquivo .txt");
      return;
    }

    // Ler o conteúdo do arquivo
    const text = await file.text();
    setFileContent(text);
    setLines(text.split('\n')); 
  };

  const getFilteredContent = useMemo(() => {
    if (!debouncedSearchTerm) return fileContent;
    
    try {
      const regex = new RegExp(debouncedSearchTerm, 'i');
      return lines
        .filter(line => regex.test(line))
        .join('\n');
    } catch (error) {
      // Caso a regex seja inválida, volta para busca normal
      console.error(error);
      return lines
        .filter(line => line.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
        .join('\n');
    }
  }, [debouncedSearchTerm, lines, fileContent]);

  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setDebouncedSearchTerm(term);
    }, 300),
    []
  );


  return (
    <div className={`${geistSans.variable} ${geistMono.variable} align-middle`}>
      <Analytics/>
      <div>
        <h1 className="text-2xl font-bold mb-4 mt-8 text-center">Acervo</h1>
      </div>
      <div className="mb-4">
        <div className="align-middle top-24 w-full flex justify-center z-10">
        <input
          type="file"
          accept=".txt"
          onChange={handleFileChange}
          className="block w-64 text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100"
        />
        </div>

        {fileContent && (
          <div className="mt-4 w-full">
            <input
              type="text"
              placeholder="Pesquisar no arquivo..."
              value={searchTerm}
              onChange={(e) => {setSearchTerm(e.target.value); debouncedSearch(e.target.value);}}
              className="w-full p-2 mb-4 border rounded-lg text-black"
            />
            <h2 className="text-xl font-semibold mb-2">Conteúdo do arquivo:</h2>
            <pre className="bg-black text p-4 rounded-lg whitespace-pre-wrap font-mono max-w-5xl">
              {getFilteredContent}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
