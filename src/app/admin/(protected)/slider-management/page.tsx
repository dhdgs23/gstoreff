
import { getSliderImages } from './actions';
import SliderManager from './_components/slider-manager';
import { unstable_noStore as noStore } from 'next/cache';

export default async function SliderManagementPage() {
  noStore();
  const images = await getSliderImages();
  
  return <SliderManager initialImages={images} />;
}
