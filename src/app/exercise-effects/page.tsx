'use client';

import { useEffect, useReducer } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Flight {
  id: string;
  price: number;
  airline: string;
  departureTime: string;
  arrivalTime: string;
}

interface Hotel {
  id: string;
  name: string;
  price: number;
  rating: number;
}

interface BookingState {
  status: 'idle' | 'searchingFlights' | 'searchingHotels' | 'error';
  inputs: {
    destination: string;
    startDate: string;
    endDate: string;
  };
  error: string | null;
  selectedFlight: Flight | null;
  selectedHotel: Hotel | null;
}

const initialState: BookingState = {
  status: 'idle',
  inputs: {
    destination: '',
    startDate: '',
    endDate: '',
  },
  error: null,
  selectedFlight: null,
  selectedHotel: null,
};

type Action = {
  type: 'UPDATE_DESTINATION';
  payload: { destination: string; };
} | {
  type: 'UPDATE_START_DATE';
  payload: { startDate: string; };
} | {
  type: 'UPDATE_END_DATE';
  payload: { endDate: string; };
} | {
  type: 'SET_FLIGHT_SEARCH_RESULT';
  payload: { flight: Flight; };
} | {
  type: 'SET_ERROR';
  payload: { error: string; };
} | {
  type: 'SET_HOTEL_SEARCH_RESULT';
  payload: { hotel: Hotel; };
}

function searchReducer(state: BookingState, action: Action): BookingState {
  switch (action.type) {
    case 'UPDATE_DESTINATION':
      return {
        ...state,
        status: !!(action.payload.destination && state.inputs.startDate && state.inputs.endDate) ? 'searchingFlights' : 'idle',
        inputs: {
          ...state.inputs,
          destination: action.payload.destination,
        },
        error: null,
      }
    case 'UPDATE_START_DATE':
      return {
        ...state,
        status: !!(state.inputs.destination && action.payload.startDate && state.inputs.endDate) ? 'searchingFlights' : 'idle',
        inputs: {
          ...state.inputs,
          startDate: action.payload.startDate,
        },
        error: null,
      }
    case 'UPDATE_END_DATE':
      return {
        ...state,
        status: !!(state.inputs.destination && state.inputs.startDate && action.payload.endDate) ? 'searchingFlights' : 'idle',
        inputs: {
          ...state.inputs,
          endDate: action.payload.endDate,
        },
        error: null,
      }
    case 'SET_FLIGHT_SEARCH_RESULT':
      return {
        ...state,
        selectedFlight: action.payload.flight,
        error: null,
        status: 'searchingHotels',
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload.error,
        status: 'error',
      }
    case 'SET_HOTEL_SEARCH_RESULT':
      return {
        ...state,
        selectedHotel: action.payload.hotel,
        error: null,
        status: 'idle',
      }
    default: 
      return state;
  } 
}

export default function TripSearch() {
  // Search states
  const [state, dispatch] = useReducer(searchReducer, initialState);
  const { status, error, selectedFlight, selectedHotel } = state;
  
  // Effect 2: Simulate flight search
  useEffect(() => {
    const searchFlights = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock flight data
        const flights: Flight[] = [
          {
            id: '1',
            price: 299,
            airline: 'Mock Airlines',
            departureTime: '10:00 AM',
            arrivalTime: '2:00 PM',
          },
          {
            id: '2',
            price: 399,
            airline: 'Demo Airways',
            departureTime: '2:00 PM',
            arrivalTime: '6:00 PM',
          },
        ];

        // Pick the cheapest flight
        const bestFlight = flights.reduce((prev, current) =>
          prev.price < current.price ? prev : current
        );

        dispatch({ type: 'SET_FLIGHT_SEARCH_RESULT', payload: { flight: bestFlight } });
      } catch {
        dispatch({ type: 'SET_ERROR', payload: { error: 'Failed to search flights' } });
      }
    };

    const searchHotels = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Mock hotel data
        const hotels: Hotel[] = [
          {
            id: '1',
            name: 'Grand Hotel',
            price: 150,
            rating: 4.5,
          },
          {
            id: '2',
            name: 'Budget Inn',
            price: 80,
            rating: 3.8,
          },
        ];

        // Pick the best rated hotel
        const bestHotel = hotels.reduce((prev, current) =>
          prev.rating > current.rating ? prev : current
        );

        dispatch({ type: 'SET_HOTEL_SEARCH_RESULT', payload: { hotel: bestHotel } });
      } catch {
        dispatch({ type: 'SET_ERROR', payload: { error: 'Failed to search hotels' } });
      }
    };

    if (status === 'searchingFlights') {
      searchFlights();
    } else if (status === 'searchingHotels') {
      searchHotels();
    }
  }, [status]);

  return (
    <div className="p-8 w-full max-w-2xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Search Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              onBlur={(e) => dispatch({ type: 'UPDATE_DESTINATION', payload: { destination: e.target.value.trim() } })}
              placeholder="Enter destination"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={state.inputs.startDate}
              onChange={(e) => dispatch({ type: 'UPDATE_START_DATE', payload: { startDate: e.target.value } })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={state.inputs.endDate}
              onChange={(e) => dispatch({ type: 'UPDATE_END_DATE', payload: { endDate: e.target.value } })}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <Card className={status === 'searchingFlights' ? 'opacity-50' : ''}>
          <CardHeader>
            <CardTitle>Flight Search</CardTitle>
          </CardHeader>
          <CardContent>
            {status === 'searchingFlights' ? (
              <p>Searching for flights...</p>
            ) : selectedFlight ? (
              <div className="space-y-2">
                <p className="font-medium">Selected Flight:</p>
                <p>Airline: {selectedFlight.airline}</p>
                <p>Price: ${selectedFlight.price}</p>
                <p>Departure: {selectedFlight.departureTime}</p>
                <p>Arrival: {selectedFlight.arrivalTime}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card
          className={
            status === 'searchingHotels' || status === 'searchingFlights' ? 'opacity-50' : ''
          }
        >
          <CardHeader>
            <CardTitle>Hotel Search</CardTitle>
          </CardHeader>
          <CardContent>
            {status === 'searchingHotels' ? (
              <p>Searching for hotels...</p>
            ) : selectedHotel ? (
              <div className="space-y-2">
                <p className="font-medium">Selected Hotel:</p>
                <p>Name: {selectedHotel.name}</p>
                <p>Price: ${selectedHotel.price}/night</p>
                <p>Rating: {selectedHotel.rating}/5</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
