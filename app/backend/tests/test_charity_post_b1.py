import unittest
from pydantic import ValidationError
from models.charity_post import CharityPostDonateRequest, CharityPostCreate, CharityPostUpdate

class TestCharityPostB1B5(unittest.TestCase):
    def test_donation_amount_validation(self):
        # Positive donation should pass
        donation = CharityPostDonateRequest(amount=10.0)
        self.assertEqual(donation.amount, 10.0)
        
        # Zero donation should fail
        with self.assertRaises(ValidationError):
            CharityPostDonateRequest(amount=0.0)
            
        # Negative donation should fail
        with self.assertRaises(ValidationError):
            CharityPostDonateRequest(amount=-5.0)

    def test_amount_needed_validation(self):
        # CharityPostCreate
        # Positive should pass
        create = CharityPostCreate(title="Test", amountNeeded=100.0)
        self.assertEqual(create.amountNeeded, 100.0)

        # Zero should fail
        with self.assertRaises(ValidationError):
            CharityPostCreate(title="Test", amountNeeded=0.0)

        # Negative should fail
        with self.assertRaises(ValidationError):
            CharityPostCreate(title="Test", amountNeeded=-10.0)

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

if __name__ == "__main__":
    unittest.main()
