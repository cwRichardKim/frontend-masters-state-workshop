'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { create } from 'zustand';

// Types
const enum Step {
  FlightSearch = 'FlightSearch',
  FlightResults = 'FlightResults',
  HotelSearch = 'HotelSearch',
  HotelResults = 'HotelResults',
  Review = 'Review',
  Confirmation = 'Confirmation',
}

interface FlightOption {
  id: string;
  airline: string;
  price: number;
  duration: string;
}

interface HotelOption {
  id: string;
  name: string;
  price: number;
  rating: number;
  amenities: string[];
}

interface BookingState {
  currentStep: Step;
  flightSearch: {
    destination: string;
    departure: string;
    arrival: string;
    passengers: number;
    isOneWay: boolean;
  };
  selectedFlight: FlightOption | null;
  hotelSearch: {
    checkIn: string;
    checkOut: string;
    guests: number;
    roomType: string;
  };
  selectedHotel: HotelOption | null;
}

// Action types
type BookingAction =
  | { type: 'changeFlight' }
  | {
      type: 'hotelSearchUpdated';
      payload: Partial<{
        checkIn: string;
        checkOut: string;
        guests: number;
        roomType: string;
      }>;
    }
  | { type: 'searchHotels' }
  | { type: 'changeHotel' }
  | { type: 'book' }

const initialState: BookingState = {
  currentStep: Step.FlightSearch,
  flightSearch: {
    destination: '',
    departure: '',
    arrival: '',
    passengers: 1,
    isOneWay: false,
  },
  selectedFlight: null,
  hotelSearch: {
    checkIn: '',
    checkOut: '',
    guests: 1,
    roomType: 'standard',
  },
  selectedHotel: null,
};

const useBookingStore = create<BookingState & {
  searchFlights: () => void;
  flightSearchUpdated: (payload: Partial<{
    destination: string;
    departure: string;
    arrival: string;
    passengers: number;
    isOneWay: boolean;
  }>) => void;
  flightSelected: (flight: FlightOption) => void;
  back: () => void;
  searchHotels: () => void;
  hotelSelected: (hotel: HotelOption) => void;
  hotelSearchUpdated: (payload: Partial<{
    checkIn: string;
    checkOut: string;
    guests: number;
    roomType: string;
  }>) => void;
  book: () => void;
  changeFlight: () => void;
  changeHotel: () => void;
}>((set) => ({
  currentStep: Step.FlightSearch,
  flightSearch: {
    destination: '',
    departure: '',
    arrival: '',
    passengers: 1,
    isOneWay: false,
  },
  selectedFlight: null,
  hotelSearch: {
    checkIn: '',
    checkOut: '',
    guests: 1,
    roomType: 'standard',
  },
  selectedHotel: null,

  searchFlights: () => set({ currentStep: Step.FlightResults }),
  flightSearchUpdated: (payload) => set((state) => ({ 
    flightSearch: { ...state.flightSearch, ...payload } 
  })),
  flightSelected: (flight) => set({ selectedFlight: flight, currentStep: Step.HotelSearch }),
  back: () => set((state) => {
    switch (state.currentStep) {
      case Step.FlightResults:
        return { currentStep: Step.FlightSearch };
      case Step.HotelSearch:
        return { currentStep: Step.FlightResults };
      case Step.HotelResults:
        return { currentStep: Step.HotelSearch };
      case Step.Review:
        return { currentStep: Step.HotelResults };
      default:
        return {};
    }
  }),
  searchHotels: () => set({ currentStep: Step.HotelResults }),
  hotelSelected: (hotel) => set({ selectedHotel: hotel, currentStep: Step.Review }),
  hotelSearchUpdated: (payload) => set((state) => ({ 
    hotelSearch: { ...state.hotelSearch, ...payload } 
  })),
  book: () => set({ currentStep: Step.Confirmation }),
  changeFlight: () => set({ currentStep: Step.FlightSearch }),
  changeHotel: () => set({ currentStep: Step.HotelSearch }),
}));

function FlightBookingForm() {
  const flightSearch = useBookingStore((state) => state.flightSearch);
  const searchFlights = useBookingStore((state) => state.searchFlights);
  const flightSearchUpdated = useBookingStore((state) => state.flightSearchUpdated);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    searchFlights();
  };

  console.log('rerendering FlightBookingForm')

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Switch
          id="one-way"
          checked={flightSearch.isOneWay}
          onCheckedChange={(checked) =>
            flightSearchUpdated({ isOneWay: checked })
          }
        />
        <Label htmlFor="one-way">One-way flight</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="destination">Destination</Label>
        <Input
          type="text"
          id="destination"
          value={flightSearch.destination}
          onChange={(e) =>
            flightSearchUpdated({ destination: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="departure">Departure Date</Label>
        <Input
          type="date"
          id="departure"
          value={flightSearch.departure}
          onChange={(e) =>
            flightSearchUpdated({ departure: e.target.value })
          }
          required
        />
      </div>

      {!flightSearch.isOneWay && (
        <div className="space-y-2">
          <Label htmlFor="arrival">Return Date</Label>
          <Input
            type="date"
            id="arrival"
            value={flightSearch.arrival}
            onChange={(e) =>
              flightSearchUpdated({ arrival: e.target.value })
            }
            required
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="passengers">Number of Passengers</Label>
        <Input
          type="number"
          id="passengers"
          value={flightSearch.passengers}
          onChange={(e) =>
            flightSearchUpdated({ passengers: parseInt(e.target.value) })
          }
          min="1"
          max="9"
          required
        />
      </div>

      <Button type="submit" className="w-full">
        Search Flights
      </Button>
    </form>
  );
}

function FlightSearchResults() {
  const { back, selectedFlight, flightSelected } = useBookingStore();

  const mockFlights: FlightOption[] = [
    { id: '1', airline: 'Sky Airways', price: 299, duration: '2h 30m' },
    { id: '2', airline: 'Ocean Air', price: 349, duration: '2h 45m' },
    { id: '3', airline: 'Mountain Express', price: 279, duration: '3h 15m' },
  ];

  const handleSelectFlight = (flight: FlightOption) => {
    flightSelected(flight);
  };

  console.log('rerendering FlightSearchResults')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Available Flights</h2>
        <Button
          variant="outline"
          onClick={back}
        >
          Back to Search
        </Button>
      </div>

      <div className="space-y-4">
        {mockFlights.map((flight) => (
          <div
            key={flight.id}
            className={`p-4 border rounded hover:shadow-md ${
              selectedFlight?.id === flight.id
                ? 'border-blue-500 bg-blue-50'
                : ''
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{flight.airline}</h3>
                <p className="text-gray-600">Duration: {flight.duration}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">${flight.price}</p>
                <Button
                  className="mt-2"
                  onClick={() => handleSelectFlight(flight)}
                >
                  Select
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HotelBookingForm() {
  const { back, hotelSearch, searchHotels, hotelSearchUpdated } = useBookingStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchHotels();
  };

  console.log('rerendering HotelBookingForm')

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Hotel Search</h2>
        <Button
          variant="outline"
          onClick={back}
        >
          Back to Flights
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="checkIn">Check-in Date</Label>
        <Input
          type="date"
          id="checkIn"
          value={hotelSearch.checkIn}
          onChange={(e) =>
            hotelSearchUpdated({ checkIn: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="checkOut">Check-out Date</Label>
        <Input
          type="date"
          id="checkOut"
          value={hotelSearch.checkOut}
          onChange={(e) =>
            hotelSearchUpdated({ checkOut: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="guests">Number of Guests</Label>
        <Input
          type="number"
          id="guests"
          value={hotelSearch.guests}
          onChange={(e) =>
            hotelSearchUpdated({ guests: parseInt(e.target.value) })
          }
          min="1"
          max="4"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="roomType">Room Type</Label>
        <select
          id="roomType"
          value={hotelSearch.roomType}
          onChange={(e) =>
            hotelSearchUpdated({ roomType: e.target.value })
          }
          className="w-full p-2 border rounded"
          required
        >
          <option value="standard">Standard</option>
          <option value="deluxe">Deluxe</option>
          <option value="suite">Suite</option>
        </select>
      </div>

      <Button type="submit" className="w-full">
        Search Hotels
      </Button>
    </form>
  );
}

function HotelSearchResults() {
  const { back, hotelSelected, selectedHotel } = useBookingStore();

  console.log('rerendering HotelSearchResults')

  const mockHotels: HotelOption[] = [
    {
      id: '1',
      name: 'Grand Hotel',
      price: 199,
      rating: 4.5,
      amenities: ['Pool', 'Spa', 'Restaurant'],
    },
    {
      id: '2',
      name: 'Seaside Resort',
      price: 249,
      rating: 4.8,
      amenities: ['Beach Access', 'Pool', 'Bar'],
    },
    {
      id: '3',
      name: 'City Center Hotel',
      price: 179,
      rating: 4.2,
      amenities: ['Gym', 'Restaurant', 'Business Center'],
    },
  ];

  console.log('rerendering BookingReview')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Available Hotels</h2>
        <Button
          variant="outline"
          onClick={back}
        >
          Back to Search
        </Button>
      </div>

      <div className="space-y-4">
        {mockHotels.map((hotel) => (
          <div
            key={hotel.id}
            className={`p-4 border rounded hover:shadow-md ${
              selectedHotel?.id === hotel.id ? 'border-blue-500 bg-blue-50' : ''
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{hotel.name}</h3>
                <p className="text-gray-600">Rating: {hotel.rating}/5</p>
                <p className="text-sm text-gray-500">
                  {hotel.amenities.join(', ')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">${hotel.price}/night</p>
                <Button
                  className="mt-2"
                  onClick={() => hotelSelected(hotel)}
                >
                  Select
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingReview() {
  const { back, book, selectedFlight, selectedHotel, flightSearch, hotelSearch, changeFlight, changeHotel } = useBookingStore();

  console.log('rerendering BookingReview')

  const handleConfirm = () => {
    book();
  };

  const handleBack = () => {
    back();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Review Your Booking</h2>

      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h3 className="font-bold mb-2">Flight Details</h3>
          <p>Airline: {selectedFlight?.airline}</p>
          <p>Duration: {selectedFlight?.duration}</p>
          <p>Price: ${selectedFlight?.price}</p>
          <p>Passengers: {flightSearch.passengers}</p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={changeFlight}
          >
            Change Flight
          </Button>
        </div>

        <div className="p-4 border rounded">
          <h3 className="font-bold mb-2">Hotel Details</h3>
          <p>Hotel: {selectedHotel?.name}</p>
          <p>Rating: {selectedHotel?.rating}/5</p>
          <p>Price: ${selectedHotel?.price}/night</p>
          <p>Room Type: {hotelSearch.roomType}</p>
          <p>Guests: {hotelSearch.guests}</p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={changeHotel}
          >
            Change Hotel
          </Button>
        </div>

        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-bold mb-2">Total Cost</h3>
          <p className="text-xl">
            ${(selectedFlight?.price || 0) + (selectedHotel?.price || 0)}
          </p>
        </div>

        <div className="flex space-x-4">
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Button onClick={handleConfirm}>Confirm Booking</Button>
        </div>
      </div>
    </div>
  );
}

function BookingConfirmation() {
  const { selectedFlight, selectedHotel } = useBookingStore();

  console.log('rerendering BookingConfirmation')

  return (
    <div className="text-center space-y-6">
      <div className="text-6xl">🎉</div>
      <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
      <p className="text-gray-600">
        Thank you for booking with us. Your confirmation details have been sent
        to your email.
      </p>
      <div className="p-4 border rounded inline-block text-left">
        <h3 className="font-bold mb-2">Booking Reference</h3>
        <p>Flight: {selectedFlight?.airline}</p>
        <p>Hotel: {selectedHotel?.name}</p>
      </div>
    </div>
  );
}

// Main Component
function BookingApp() {
  const currentStep = useBookingStore((state) => state.currentStep);

  console.log('rerendering BookingApp')

  const renderStep = () => {
    switch (currentStep) {
      case Step.FlightSearch:
        return <FlightBookingForm />;
      case Step.FlightResults:
        return <FlightSearchResults />;
      case Step.HotelSearch:
        return <HotelBookingForm />;
      case Step.HotelResults:
        return <HotelSearchResults />;
      case Step.Review:
        return <BookingReview />;
      case Step.Confirmation:
        return <BookingConfirmation />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Flight & Hotel Booking</h1>
      {renderStep()}
    </div>
  );
}

export default function Exercise8() {
  console.log('rerendering Exercise8')
  return (
    <BookingApp />
  );
}
