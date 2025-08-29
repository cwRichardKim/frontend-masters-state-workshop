'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useReducer, useState } from 'react';
import { FlightOption, getFlightOptions } from '@/app/exerciseUtils';

interface SearchResultsProps {
  flightOptions: FlightOption[];
  passengers: number;
  onBack: () => void;
}

function SearchResults({
  flightOptions,
  passengers,
  onBack,
}: SearchResultsProps) {
  const [selectedFlight, setSelectedFlight] = useState<FlightOption | null>(
    null
  );
  const totalPrice = selectedFlight ? selectedFlight.price * passengers : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Search Results</h2>
        <Button variant="outline" onClick={onBack}>
          Back to Search
        </Button>
      </div>

      <div className="space-y-4">
        {flightOptions.map((flight) => (
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
                  className="mt-2 bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                  onClick={() => setSelectedFlight(flight)}
                >
                  {selectedFlight?.id === flight.id ? 'Selected' : 'Select'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedFlight && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Booking Summary</h3>
          <div className="space-y-2">
            <p>Flight: {selectedFlight.airline}</p>
            <p>Duration: {selectedFlight.duration}</p>
            <p>Passengers: {passengers}</p>
            <p className="text-xl font-bold mt-4">Total: ${totalPrice}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function BookingForm({
  onSubmit,
  isSubmitting,
  searchParams,
}: {
  onSubmit: (formData: {
    destination: string;
    departure: string;
    arrival: string;
    passengers: number;
    isOneWay: boolean;
  }) => void;
  isSubmitting: boolean;
  searchParams: SearchParams | null;
}) {
  const [destination, setDestination] = useState(searchParams?.destination || '');
  const [departure, setDeparture] = useState(searchParams?.departure || '');
  const [arrival, setArrival] = useState(searchParams?.arrival || '');
  const [passengers, setPassengers] = useState(searchParams?.passengers || 1);
  const [isOneWay, setIsOneWay] = useState(searchParams?.isOneWay || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      destination,
      departure,
      arrival,
      passengers,
      isOneWay,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Switch id="one-way" checked={isOneWay} onCheckedChange={setIsOneWay} />
        <Label htmlFor="one-way">One-way flight</Label>
      </div>

      <div>
        <Label htmlFor="destination" className="block mb-1">
          Destination
        </Label>
        <Input
          type="text"
          id="destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="departure" className="block mb-1">
          Departure Date
        </Label>
        <Input
          type="date"
          id="departure"
          value={departure}
          onChange={(e) => setDeparture(e.target.value)}
          required
        />
      </div>

      {!isOneWay && (
        <div>
          <Label htmlFor="arrival" className="block mb-1">
            Return Date
          </Label>
          <Input
            type="date"
            id="arrival"
            value={arrival}
            onChange={(e) => setArrival(e.target.value)}
            required
          />
        </div>
      )}

      <div>
        <Label htmlFor="passengers" className="block mb-1">
          Number of Passengers
        </Label>
        <Input
          type="number"
          id="passengers"
          value={passengers}
          onChange={(e) => setPassengers(parseInt(e.target.value))}
          min="1"
          max="9"
          required
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Searching...' : 'Search Flights'}
      </Button>
    </form>
  );
}

function SearchContainer() {
  return <div>SearchContainer</div>
}

interface SearchParams {
  destination: string;
  departure: string;
  arrival: string;
  passengers: number;
  isOneWay: boolean;
}

type FlowState = {
  stage: 'search',
  status: 'idle' | 'error'
  searchParams?: SearchParams,
} | {
  stage: 'search',
  status: 'submitting'
  searchParams: SearchParams,
} | {
  status: 'idle',
  stage: 'search_results',
  results: FlightOption[],
  searchParams: SearchParams,
  selectedFlight: FlightOption | null,
}

type FlowAction = {
  type: 'submit_search'
  searchParams: SearchParams,
} | {
  type: 'received_results',
  results: FlightOption[],
} | {
  type: 'select_flight',
  flight: FlightOption,
} | {
  type: 'back_to_search',
} | {
  type: 'error',
}

function flowReducer(state: FlowState, action: FlowAction) {
  switch (action.type) {
    case 'submit_search':
      return { ...state, stage: 'search', status: 'submitting', searchParams: action.searchParams };
    case 'received_results':
      return { ...state, stage: 'search_results', status: 'idle', results: action.results };
    case 'select_flight':
      return { ...state, selectedFlight: action.flight };
    case 'back_to_search':
      return { ...state, stage: 'search', status: 'idle' };
    case 'error':
      return { ...state, status: 'error' };
    default:
      return state;
  }
}

const initialState: FlowState = { stage: 'search', status: 'idle' };

export default function Page() {
  const [state, dispatch] = useReducer(flowReducer, initialState);

  const handleSubmit = async (formData: SearchParams) => {
    dispatch({ type: 'submit_search', searchParams: formData });

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockFlights = await getFlightOptions(formData);
      dispatch({ type: 'received_results', results: mockFlights })
    } catch {
      dispatch({ type: 'error' })
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Flight Booking</h1>

      test

      {(state.stage === 'search') && (
        <BookingForm onSubmit={handleSubmit} isSubmitting={state.status === 'submitting'} searchParams={state.searchParams} />
      )}
      {state.status === 'error' && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          An error occurred while searching for flights. Please try again.
        </div>
      )}
      {state.stage === 'search_results' && (
        <SearchResults
          flightOptions={state.results}
          passengers={state.searchParams.passengers}
          onBack={() => dispatch({ type: 'back_to_search' })}
        />
      )}
    </div>
  );
}
