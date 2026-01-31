
import DownloadManager from './_components/download-manager';
import { unstable_noStore as noStore } from 'next/cache';

export default function DownloadsPage() {
    noStore();
    return <DownloadManager />;
}
