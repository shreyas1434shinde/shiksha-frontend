import * as React from 'react';

import { Checkbox, Divider, InputAdornment, TextField } from '@mui/material';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import { Height } from '@mui/icons-material';
import Modal from '@mui/material/Modal';
import SearchIcon from '@mui/icons-material/Search';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'next-i18next';

interface ManageUsersModalProps {
  centersName: string[];
}

const ManageCentersModal: React.FC<ManageUsersModalProps> = ({
  centersName,
}) => {
  const theme = useTheme<any>();
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '85%',
    bgcolor: theme.palette.warning['A400'],
    boxShadow: 24,
    borderRadius: '16px',
    height: '526px',
    '@media (min-width: 600px)': {
      width: '450px',
    },
  };

  return (
    <div>
      <Button onClick={handleOpen}>Open modal</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box
            display={'flex'}
            justifyContent={'space-between'}
            sx={{ padding: '20px' }}
          >
            <Box marginBottom={'0px'}>
              <Typography
                variant="h2"
                sx={{
                  color: theme.palette.warning['A200'],
                  fontSize: '16px',
                }}
                component="h2"
              >
                {t('COMMON.MANAGE_CENTERS')}
              </Typography>
            </Box>
            <CloseIcon
              sx={{
                cursor: 'pointer',
                color: theme.palette.warning['A200'],
              }}
              onClick={() => handleClose()}
            />
          </Box>
          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'center', p: '20px' }}>
            <TextField
              className="input_search"
              placeholder="Search Facilitators.."
              color="secondary"
              focused
              sx={{
                borderRadius: '100px',
                height: '40px',
                // width: '225px',
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box mx={'20px'}>
            <Box sx={{ height: '37vh', mt: '10px', overflowY: 'auto' }}>
              {centersName?.map((name, index) => {
                return (
                  <React.Fragment key={index}>
                    <Box
                      borderBottom={theme.palette.warning['A100']}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          fontSize: '16px',
                          color: theme.palette.warning['300'],
                          pb: '20px',
                        }}
                      >
                        {name}
                      </Box>
                      <Box>
                        <Checkbox
                          sx={{ pb: '20px' }}
                          className="checkBox_svg"
                        />
                      </Box>
                    </Box>
                  </React.Fragment>
                );
              })}
            </Box>
          </Box>
          <Divider />
          <Box p={'20px'}>
            <Button
              className="w-100"
              sx={{ boxShadow: 'none' }}
              variant="contained"
            >
              {t('COMMON.ASSIGN')}
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default ManageCentersModal;