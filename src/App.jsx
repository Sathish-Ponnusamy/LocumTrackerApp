import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';

// Replace this with your Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = 'YOUR_DEPLOYED_WEB_APP_URL_GOES_HERE';

function App() {
  const [shifts, setShifts] = useState([]);
  const [date, setDate] = useState(null);
  const [agency, setAgency] = useState('');
  const [location, setLocation] = useState('');
  const [hours, setHours] = useState('');
  const [rate, setRate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Pending');
  const [amountReceived, setAmountReceived] = useState('');
  const [receivedDate, setReceivedDate] = useState(null);
  const [taxStatus, setTaxStatus] = useState('Not Filed');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL);
      const data = await response.json();
      setShifts(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch shifts');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!date || !agency || !location || !hours || !rate) {
      alert('Please fill in all required fields');
      return;
    }

    const daySalary = parseFloat(hours) * parseFloat(rate);
    
    const newShift = {
      date: format(date, 'yyyy-MM-dd'),
      agency,
      location,
      hours: parseFloat(hours),
      rate: parseFloat(rate),
      daySalary,
      paymentStatus,
      amountReceived: amountReceived ? parseFloat(amountReceived) : '',
      receivedDate: receivedDate ? format(receivedDate, 'yyyy-MM-dd') : '',
      taxStatus
    };

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(newShift)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Refresh the shifts list
      fetchShifts();

      // Reset form
      setDate(null);
      setAgency('');
      setLocation('');
      setHours('');
      setRate('');
      setPaymentStatus('Pending');
      setAmountReceived('');
      setReceivedDate(null);
      setTaxStatus('Not Filed');
    } catch (error) {
      setError('Failed to add shift');
    }
  };

  const handleUpdateShift = (shift) => {
    setSelectedShift(shift);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedShift(null);
  };

  const handleSaveUpdate = async () => {
    if (!selectedShift) return;

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'PUT',
        body: JSON.stringify(selectedShift)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Refresh the shifts list
      fetchShifts();
      handleCloseDialog();
    } catch (error) {
      setError('Failed to update shift');
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Locum Shift Tracker
        </Typography>

        {/* Add New Shift Form */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Add New Shift
          </Typography>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={date}
                  onChange={setDate}
                  renderInput={(params) => <TextField {...params} required />}
                />
              </LocalizationProvider>

              <TextField
                label="Agency"
                value={agency}
                onChange={(e) => setAgency(e.target.value)}
                required
              />

              <TextField
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />

              <TextField
                label="Hours"
                type="number"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                required
              />

              <TextField
                label="Rate"
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                required
              />

              <FormControl>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  label="Payment Status"
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Amount Received"
                type="number"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
              />

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Received Date"
                  value={receivedDate}
                  onChange={setReceivedDate}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>

              <FormControl>
                <InputLabel>Tax Status</InputLabel>
                <Select
                  value={taxStatus}
                  onChange={(e) => setTaxStatus(e.target.value)}
                  label="Tax Status"
                >
                  <MenuItem value="Not Filed">Not Filed</MenuItem>
                  <MenuItem value="Filed">Filed</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Button type="submit" variant="contained" color="primary">
                Add Shift
              </Button>
            </Box>
          </form>
        </Paper>

        {/* Shifts Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Agency</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Hours</TableCell>
                <TableCell>Rate</TableCell>
                <TableCell>Day Salary</TableCell>
                <TableCell>Payment Status</TableCell>
                <TableCell>Amount Received</TableCell>
                <TableCell>Received Date</TableCell>
                <TableCell>Tax Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell>{shift.date}</TableCell>
                  <TableCell>{shift.agency}</TableCell>
                  <TableCell>{shift.location}</TableCell>
                  <TableCell>{shift.hours}</TableCell>
                  <TableCell>{shift.rate}</TableCell>
                  <TableCell>{shift.daySalary}</TableCell>
                  <TableCell>{shift.paymentStatus}</TableCell>
                  <TableCell>{shift.amountReceived}</TableCell>
                  <TableCell>{shift.receivedDate}</TableCell>
                  <TableCell>{shift.taxStatus}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => handleUpdateShift(shift)}
                    >
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Update Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Update Shift</DialogTitle>
          <DialogContent>
            {selectedShift && (
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr', pt: 2 }}>
                <FormControl>
                  <InputLabel>Payment Status</InputLabel>
                  <Select
                    value={selectedShift.paymentStatus}
                    onChange={(e) => setSelectedShift({
                      ...selectedShift,
                      paymentStatus: e.target.value
                    })}
                    label="Payment Status"
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Paid">Paid</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Amount Received"
                  type="number"
                  value={selectedShift.amountReceived}
                  onChange={(e) => setSelectedShift({
                    ...selectedShift,
                    amountReceived: e.target.value
                  })}
                />

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Received Date"
                    value={selectedShift.receivedDate ? new Date(selectedShift.receivedDate) : null}
                    onChange={(date) => setSelectedShift({
                      ...selectedShift,
                      receivedDate: date ? format(date, 'yyyy-MM-dd') : ''
                    })}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>

                <FormControl>
                  <InputLabel>Tax Status</InputLabel>
                  <Select
                    value={selectedShift.taxStatus}
                    onChange={(e) => setSelectedShift({
                      ...selectedShift,
                      taxStatus: e.target.value
                    })}
                    label="Tax Status"
                  >
                    <MenuItem value="Not Filed">Not Filed</MenuItem>
                    <MenuItem value="Filed">Filed</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSaveUpdate} color="primary">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default App;