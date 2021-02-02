import { Photo, getPhotos } from './photoHandler';
import React, { FormEvent, MutableRefObject, useEffect, useRef, useState } from 'react';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import JustifiedLayout from 'justified-layout';
import PhotoCard from './PhotoCard';
import { RootState } from '../store';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PhotosPage: React.FC = () => {
  const [photoList, setPhotoList] = useState<Array<Photo>>([]);
  const [photoCards, setPhotoCards] = useState<JSX.Element[]>([]);
  const [photoPageHeight, setPhotoPageHeight] = useState(0.0);
  const [currPage, setCurrPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [pageSize, setPageSize] = useState(18);
  const [numPages, setNumPages] = useState(1);
  const [showPages, setShowPages] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [showSpinner, setShowSpinner] = useState(true);
  const [numLoading, setNumLoading] = useState(0);
  const [initFinished, setInitFinished] = useState(false);

  const authState = useSelector((state: RootState) => state.auth);

  const pageInputRef = useRef() as MutableRefObject<HTMLInputElement>;
  const containerRef = useRef() as MutableRefObject<HTMLDivElement>;

  const history = useHistory();

  useEffect(() => {
    setContainerWidth(containerRef.current ? containerRef.current.offsetWidth : 0);

    const handleWindowResize = () => setContainerWidth(containerRef.current ? containerRef.current.offsetWidth : 0);
    window.addEventListener('resize', handleWindowResize);

    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  useEffect(() => {
    const fetchPhotos = async () => {
      if (authState.accessToken != null) {
        const photos = await getPhotos((currPage - 1) * pageSize, pageSize);
        if (photos != null && photos.items.photos != null) {
          setPhotoList(photos.items.photos);
          setInitFinished(true);

          const totalPages = Math.ceil(photos.total / pageSize);
          setNumPages(totalPages);

          if (totalPages === 1) {
            setShowPages(false);
          } else {
            setShowPages(true);
          }
        }
      } else {
        setPhotoList([]);
      }
    };

    fetchPhotos();
  }, [authState, currPage, pageSize]);

  useEffect(() => {
    if (numLoading <= 0 && initFinished) {
      setShowSpinner(false);
    }
  }, [numLoading]);

  useEffect(() => {
    setNumLoading(photoList.length);
    setShowSpinner(true);

    const photoSizes = photoList.map((photo) => ({
      width: photo.details.width,
      height: photo.details.height,
    }));

    const photoLayout = JustifiedLayout(photoSizes, {
      containerWidth: containerWidth,
    });

    setPhotoPageHeight(photoLayout.containerHeight);

    if (photoLayout != null) {
      setPhotoCards(
        photoLayout.boxes.map((layout, index) => (
          <PhotoCard
            key={photoList[index].id}
            left={layout.left}
            top={layout.top}
            width={layout.width}
            height={layout.height}
            src={photoList[index].thumbnail_url}
            alt={photoList[index].filename}
            onClick={() => history.push(`/photos/${photoList[index].id}`)}
            onLoad={() => setNumLoading(numLoading - 1)}
          />
        )),
      );
    }
  }, [photoList]);

  const onPageChangeSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validate new page number
    const newPageNum = parseInt(pageInput);
    if (!isNaN(newPageNum) && newPageNum >= 1 && newPageNum <= numPages) {
      setCurrPage(newPageNum);
      pageInputRef.current.blur();
      setPageInput(newPageNum.toString());
    } else {
      pageInputRef.current.blur();
    }
  };

  return (
    <div ref={containerRef}>
      <div
        className={`${
          showSpinner || photoCards.length === 0 ? 'visible' : 'hidden'
        } p-4 w-full flex flex-row h-screen items-center justify-center`}
      >
        {photoCards.length === 0 && initFinished ? (
          <div className="font-default text-2xl font-medium text-center">
            <p>There&apos;s nothing here yet!</p>
            <p className="text-emerald-400">Try uploading a photo.</p>
          </div>
        ) : (
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-24 w-24" />
        )}
      </div>
      <div className={`${showSpinner ? 'hidden' : 'visible'} p-4 relative flex flex-col items-center`}>
        {photoCards}
        {showPages && (
          <div className="flex flex-col items-center" style={{ position: 'absolute', top: photoPageHeight + 10 }}>
            <div className="flex flex-row items-center mt-4 mb-4">
              {currPage !== 1 && (
                <FontAwesomeIcon
                  icon={faChevronLeft}
                  onClick={() => {
                    const newPage = currPage - 1;
                    setCurrPage(newPage);
                    setPageInput(newPage.toString());
                  }}
                  className="mr-3 text-xl cursor-pointer"
                />
              )}
              <p className="font-default text-md">Page &nbsp;</p>
              <form onSubmit={onPageChangeSubmit}>
                <input
                  className="font-default text-md appearance-none rounded relative block border border-gray-800 w-8 text-center"
                  value={pageInput}
                  ref={pageInputRef}
                  onChange={(event) => setPageInput(event.target.value)}
                  onFocus={() => setPageInput('')}
                  onBlur={() => setPageInput(currPage.toString())}
                />
              </form>
              <p className="font-default text-md">&nbsp; of {numPages}</p>
              {currPage !== numPages && (
                <FontAwesomeIcon
                  icon={faChevronRight}
                  onClick={() => {
                    const newPage = currPage + 1;
                    setCurrPage(newPage);
                    setPageInput(newPage.toString());
                  }}
                  className="ml-3 text-xl cursor-pointer"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotosPage;
