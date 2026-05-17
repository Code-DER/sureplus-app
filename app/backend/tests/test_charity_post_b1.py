import unittest
from uuid import uuid4
from datetime import datetime
from pydantic import ValidationError
from models.charity_post import CharityPostDonateRequest, CharityPostCreate, CharityPostUpdate, CharityPostResponse

class TestCharityPostB1B5(unittest.TestCase):
    def test_donation_amount_validation(self):
        # Positive donation should pass
        donation = CharityPostDonateRequest(donationType='money', amount=10.0)
        self.assertEqual(donation.amount, 10.0)
        
        # Zero donation should fail
        with self.assertRaises(ValidationError):
            CharityPostDonateRequest(donationType='money', amount=0.0)
            
        # Negative donation should fail
        with self.assertRaises(ValidationError):
            CharityPostDonateRequest(donationType='money', amount=-5.0)

    def test_amount_needed_validation(self):
        # CharityPostCreate
        # Positive should pass with donationMode='money'
        create = CharityPostCreate(title="Test", donationMode='money', amountNeeded=100.0)
        self.assertEqual(create.amountNeeded, 100.0)

        # Zero should fail
        with self.assertRaises(ValidationError):
            CharityPostCreate(title="Test", donationMode='money', amountNeeded=0.0)

        # Negative should fail
        with self.assertRaises(ValidationError):
            CharityPostCreate(title="Test", donationMode='money', amountNeeded=-10.0)

        # CharityPostUpdate
        # Positive should pass
        update = CharityPostUpdate(amountNeeded=50.0)
        self.assertEqual(update.amountNeeded, 50.0)

        # Zero should fail
        with self.assertRaises(ValidationError):
            CharityPostUpdate(amountNeeded=0.0)

        # Negative should fail
        with self.assertRaises(ValidationError):
            CharityPostUpdate(amountNeeded=-5.0)

    def test_charity_post_response_default_mode(self):
        # B-1: CharityPostResponse.donationMode should default to 'food'
        response = CharityPostResponse(
            charityID=uuid4(),
            userID=uuid4(),
            title="Test Post",
            createdAt=datetime.now()
        )
        self.assertEqual(response.donationMode, 'food')

if __name__ == "__main__":
    unittest.main()
