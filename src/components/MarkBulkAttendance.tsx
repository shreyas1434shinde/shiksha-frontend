import { Box, Button, Fade, Modal, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import Snackbar, { SnackbarOrigin } from '@mui/material/Snackbar';
import {
  attendanceStatusList,
  bulkAttendance,
} from '@/services/AttendanceService';

import { AttendanceStatusListProps } from '../utils/Interfaces';
import AttendanceStatusListView from './AttendanceStatusListView';
import Backdrop from '@mui/material/Backdrop';
import CloseIcon from '@mui/icons-material/Close';
import Loader from './Loader';
import { getMyCohortMemberList } from '@/services/MyClassDetailsService';
import { shortDateFormat, toPascalCase } from '../utils/Helper';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'next-i18next';

interface State extends SnackbarOrigin {
  openModal: boolean;
}
interface MarkBulkAttendanceProps {
  open: boolean;
  onClose: () => void;
  classId: string;
  selectedDate: Date;
  onSaveSuccess: () => void;
}

const MarkBulkAttendace: React.FC<MarkBulkAttendanceProps> = ({
  open,
  onClose,
  classId,
  selectedDate,
  onSaveSuccess,
}) => {
  const { t } = useTranslation();
  const theme = useTheme<any>();
  const [loading, setLoading] = React.useState(false);
  //   const [open, setOpen] = React.useState(false);
  const [showUpdateButton, setShowUpdateButton] = React.useState(false);
  const [cohortMemberList, setCohortMemberList] = React.useState<Array<{}>>([]);
  const [presentCount, setPresentCount] = React.useState(0);
  const [absentCount, setAbsentCount] = React.useState(0);
  const [bulkAttendanceStatus, setBulkAttendanceStatus] = React.useState('');
  const [isAllAttendanceMarked, setIsAllAttendanceMarked] =
    React.useState(false);
  const [numberOfCohortMembers, setNumberOfCohortMembers] = React.useState(0);
  const [state, setState] = React.useState<State>({
    openModal: false,
    vertical: 'top',
    horizontal: 'center',
  });
  const { vertical, horizontal, openModal } = state;

  //   const handleModalToggle = () => setOpen(!open);
  const modalContainer = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 300,
    bgcolor: theme.palette.warning['A400'],
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  const submitBulkAttendanceAction = (
    isBulkAction: boolean,
    status: string,
    id?: string | undefined
  ) => {
    const updatedAttendanceList = cohortMemberList?.map((user: any) => {
      if (isBulkAction) {
        user.attendance = status;
        setBulkAttendanceStatus(status);
      } else {
        setBulkAttendanceStatus('');
        if (user.userId === id) {
          user.attendance = status;
        }
      }
      return user;
    });
    setCohortMemberList(updatedAttendanceList);
    const hasEmptyAttendance = () => {
      const allAttendance = updatedAttendanceList.some(
        (user) => user.attendance === ''
      );
      setIsAllAttendanceMarked(!allAttendance);
      if (!allAttendance) {
        setShowUpdateButton(true);
      }
    };
    hasEmptyAttendance();
  };

  useEffect(() => {
    submitBulkAttendanceAction(true, '', '');
    const getCohortMemberList = async () => {
      setLoading(true);
      try {
        if (classId) {
          const limit = 300;
          const page = 0;
          const filters = { cohortId: classId };
          const response = await getMyCohortMemberList({
            limit,
            page,
            filters,
          });
          const resp = response?.data?.userDetails;

          if (resp) {
            const nameUserIdArray = resp?.map((entry: any) => ({
              userId: entry.userId,
              name: toPascalCase(entry.name),
            }));
            if (nameUserIdArray && selectedDate) {
              const formatSelectedDate = shortDateFormat(selectedDate);
              const userAttendanceStatusList = async () => {
                const attendanceStatusData: AttendanceStatusListProps = {
                  limit: 300,
                  page: 0,
                  filters: {
                    fromDate: formatSelectedDate,
                    toDate: formatSelectedDate,
                  },
                };
                const res = await attendanceStatusList(attendanceStatusData);
                const response = res?.data?.attendanceList;
                console.log('attendanceStatusList', response);
                if (nameUserIdArray && response) {
                  const getUserAttendanceStatus = (
                    nameUserIdArray: any[],
                    response: any[]
                  ) => {
                    const userAttendanceArray: {
                      userId: any;
                      attendance: any;
                    }[] = [];

                    nameUserIdArray.forEach((user) => {
                      const userId = user.userId;
                      const attendance = response.find(
                        (status) => status.userId === userId
                      );
                      if (attendance) {
                        userAttendanceArray.push({
                          userId,
                          attendance: attendance.attendance,
                        });
                      }
                    });
                    return userAttendanceArray;
                  };
                  const userAttendanceArray = getUserAttendanceStatus(
                    nameUserIdArray,
                    response
                  );
                  console.log('userAttendanceArray', userAttendanceArray);

                  if (nameUserIdArray && userAttendanceArray) {
                    const mergeArrays = (
                      nameUserIdArray: { userId: string; name: string }[],
                      userAttendanceArray: {
                        userId: string;
                        attendance: string;
                      }[]
                    ): {
                      userId: string;
                      name: string;
                      attendance: string;
                    }[] => {
                      const newArray: {
                        userId: string;
                        name: string;
                        attendance: string;
                      }[] = [];
                      nameUserIdArray.forEach((user) => {
                        const userId = user.userId;
                        const attendanceEntry = userAttendanceArray.find(
                          (entry) => entry.userId === userId
                        );
                        if (attendanceEntry) {
                          newArray.push({
                            userId,
                            name: user.name,
                            attendance: attendanceEntry.attendance,
                          });
                        }
                      });
                      if (newArray.length != 0) {
                        setCohortMemberList(newArray);
                        setPresentCount(newArray.filter(user => user.attendance === "present").length);
                        setAbsentCount(newArray.filter(user => user.attendance === "absent").length);
                        setNumberOfCohortMembers(newArray?.length);
                      } else {
                        setCohortMemberList(nameUserIdArray);
                        setNumberOfCohortMembers(nameUserIdArray?.length);
                      }
                      return newArray;
                    };
                    mergeArrays(nameUserIdArray, userAttendanceArray);
                  }
                }
                setLoading(false);
              };
              userAttendanceStatusList();
            }
          }
        }
      } catch (error) {
        console.error('Error fetching cohort list:', error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    if (classId !== '') {
      getCohortMemberList();
    }
  }, [classId, selectedDate]);

  const handleSave = () => {
    onClose();
    const userAttendance = cohortMemberList?.map((user: any) => {
      return {
        userId: user.userId,
        attendance: user.attendance,
      };
    });
    if (userAttendance) {
      const date = shortDateFormat(selectedDate);
      const data = {
        attendanceDate: date,
        contextId: classId,
        userAttendance,
      };
      const markBulkAttendance = async () => {
        setLoading(true);
        try {
          const response = await bulkAttendance(data);
          const resp = response?.data;
          setShowUpdateButton(true);
          onClose();
          setLoading(false);
          if (onSaveSuccess) {
            onSaveSuccess();
          }
        } catch (error) {
          console.error('Error fetching  cohort list:', error);
          setLoading(false);
        }
        handleClick({ vertical: 'bottom', horizontal: 'center' })();
      };
      markBulkAttendance();
    }
  };

  const handleClick = (newState: SnackbarOrigin) => () => {
    setState({ ...newState, openModal: true });
  };

  const handleClose = () => {
    setState({ ...state, openModal: false });
  };

  return (
    <Box>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={onClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
        className="modal_mark"
      >
        <Fade in={open}>
          <Box
            sx={{
              ...modalContainer,
              borderColor: theme.palette.warning['A400'],
              padding: '15px 10px 0 10px',
            }}
            borderRadius={'1rem'}
            height={'80%'}
          >
            <Box height={'100%'} width={'100%'}>
              <Box
                display={'flex'}
                justifyContent={'space-between'}
                sx={{ padding: '0 10px' }}
              >
                <Box marginBottom={'0px'}>
                  <Typography
                    variant="h2"
                    component="h2"
                    marginBottom={'0px'}
                    fontWeight={'500'}
                    fontSize={'16px'}
                    sx={{ color: theme.palette.warning['A200'] }}
                  >
                    {t('COMMON.MARK_CENTER_ATTENDANCE')}
                  </Typography>
                  <Typography
                    variant="h2"
                    sx={{
                      paddingBottom: '10px',
                      color: theme.palette.warning['A200'],
                      fontSize: '14px',
                    }}
                    component="h2"
                  >
                    {shortDateFormat(selectedDate)}
                  </Typography>
                </Box>
                <Box onClick={() => onClose()}>
                  <CloseIcon
                    sx={{
                      cursor: 'pointer',
                      color: theme.palette.warning['A200'],
                    }}
                  />
                </Box>
              </Box>
              <Box sx={{ height: '1px', background: '#D0C5B4' }}></Box>
              {loading && (
                <Loader showBackdrop={true} loadingText={t('COMMON.LOADING')} />
              )}

              <Typography
                sx={{
                  marginTop: '10px',
                  fontSize: '12px',
                  color: theme.palette.warning['A200'],
                  padding: '0 10px',
                }}
              >
                {t('ATTENDANCE.TOTAL_STUDENTS', {
                  count: numberOfCohortMembers,
                })}
              </Typography>
              <Box display={'flex'} justifyContent={'space-between'}>
                        <Typography
                          sx={{
                            marginTop: '0px',
                            marginLeft: '0.5rem',
                            fontSize: '12px',
                            color: theme.palette.warning['A200'],
                          }}
                        >
                          {t('ATTENDANCE.PRESENT_STUDENTS', {
                            count: presentCount,
                          })}
                        </Typography>
                        <Typography
                          sx={{
                            marginTop: '0px',
                            marginLeft: '0.5rem',
                            fontSize: '12px',
                            color: theme.palette.warning['A200'],
                          }}
                        >
                          {t('ATTENDANCE.ABSENT_STUDENTS', {
                            count: absentCount,
                          })}
                        </Typography>
                        </Box>
              {cohortMemberList && cohortMemberList?.length != 0 ? (
                <Box
                  height={'56vh'}
                  sx={{
                    overflowY: 'scroll',
                    marginTop: '10px',
                    // padding: '0 10px',
                  }}
                >
                  <Box className="modalBulk">
                    <AttendanceStatusListView
                      isEdit={true}
                      isBulkAction={true}
                      bulkAttendanceStatus={bulkAttendanceStatus}
                      handleBulkAction={submitBulkAttendanceAction}
                    />
                    {cohortMemberList?.map(
                      (
                        user: any //cohort member list should have userId, attendance, name
                      ) => (
                        <AttendanceStatusListView
                          key={user.userId}
                          userData={{
                            userId: user.userId,
                            attendance: user.attendance,
                            attendanceDate: selectedDate,
                            name: user.name,
                          }}
                          isEdit={true}
                          bulkAttendanceStatus={bulkAttendanceStatus}
                          handleBulkAction={submitBulkAttendanceAction}
                        />
                      )
                    )}
                  </Box>
                  <Box
                    position={'absolute'}
                    bottom="0"
                    display={'flex'}
                    gap={'20px'}
                    flexDirection={'row'}
                    justifyContent={'space-evenly'}
                    marginBottom={'8px'}
                    sx={{
                      background: '#fff',
                      padding: '15px 0 15px 0',
                      width: '93%',
                    }}
                  >
                    <Button
                      variant="outlined"
                      disabled={isAllAttendanceMarked ? false : true}
                      onClick={() => submitBulkAttendanceAction(true, '', '')}
                    >
                      {' '}
                      {t('COMMON.CLEAR_ALL')}
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      style={{ width: '8rem' }}
                      disabled={isAllAttendanceMarked ? false : true}
                      onClick={handleSave}
                    >
                      {showUpdateButton ? t('COMMON.UPDATE') : t('COMMON.SAVE')}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Typography style={{ fontWeight: 'bold', marginLeft: '1rem' }}>
                  {t('COMMON.NO_DATA_FOUND')}
                </Typography>
              )}
            </Box>
          </Box>
        </Fade>
      </Modal>

      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={openModal}
        onClose={handleClose}
        className="sample"
        autoHideDuration={5000}
        key={vertical + horizontal}
        message={t('ATTENDANCE.ATTENDANCE_MARKED_SUCCESSFULLY')}
        // action={action}
      />
    </Box>
  );
};

export default MarkBulkAttendace;