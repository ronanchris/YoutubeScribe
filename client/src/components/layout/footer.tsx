export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-slate-500 text-center md:text-left">YTSummarizer - Your private YouTube summary tool</p>
          <div className="flex flex-wrap justify-center mt-2 md:mt-0">
            <button className="text-sm text-slate-500 hover:text-primary mx-2 my-1">Help</button>
            <button className="text-sm text-slate-500 hover:text-primary mx-2 my-1">Settings</button>
            <button className="text-sm text-slate-500 hover:text-primary mx-2 my-1">Report Issue</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
