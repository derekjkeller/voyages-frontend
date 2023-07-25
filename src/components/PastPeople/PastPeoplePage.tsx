import { Box, Grid } from '@mui/material';
import HeaderLogoSearch from '../header/HeaderSearchLogo';
import NavBarPeople from './Header/NavBarPeople';
import PersonImage from '@/assets/personImg.png';
import PEOPLE from '@/utils/flatfiles/people_page_data.json';
import '@/style/page-past.scss';
import { Link } from 'react-router-dom';
import { setPathName } from '@/redux/getDataSetCollectionSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { ALLENSLAVED, ALLENSLAVERS } from '@/share/CONST_DATA';
import { setCurrentEnslavedPage } from '@/redux/getScrollEnslavedPageSlice';
import { setCurrentEnslaversPage } from '@/redux/getScrollEnslaversPageSlice';

const PastPeoplePage = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const dispatch: AppDispatch = useDispatch();
  return (
    <>
      <HeaderLogoSearch />
      <NavBarPeople />
      <div className="page" id="main-page-past-home">
        <Box
          sx={{
            flexGrow: 1,
            marginTop: {
              sm: '2rem',
              md: '8%',
            },
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={4} className="grid-people-image">
              <img
                className="flipped-image"
                src={PersonImage}
                alt="PersonImage"
              />
            </Grid>
            <Grid item xs={8} className="grid-people-introduction">
              {PEOPLE.map((item, index) => (
                <div key={index}>
                  <div>{item.text_introuduce}</div>
                  <div>{item.text_description}</div>
                </div>
              ))}
              <div className="btn-Enslaved-enslavers">
                <Link
                  to="/PastHomePage/enslaved"
                  style={{ textDecoration: 'none' }}
                  onClick={() => {
                    dispatch(setCurrentEnslavedPage(1));
                    dispatch(setPathName(ALLENSLAVED));
                  }}
                >
                  <div className="enslaved-btn">Enslaved</div>
                </Link>
                <Link
                  to="/PastHomePage/enslaver"
                  style={{ textDecoration: 'none' }}
                  onClick={() => {
                    dispatch(setCurrentEnslaversPage(1));
                    dispatch(setPathName(ALLENSLAVERS));
                  }}
                >
                  <div className="enslavers-btn">Enslavers</div>
                </Link>
              </div>
            </Grid>
          </Grid>
        </Box>

        <div className="credit-bottom-right">{`Credit: Artist Name ${currentYear}`}</div>
      </div>
    </>
  );
};

export default PastPeoplePage;