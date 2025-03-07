import math

# Define the values from the probability mass function
x_values = [1, 2, 3, 4, 5]
p_values = [0.39, 0.2, 0.2, 0.11, 0.1]

# Calculate E(X) (expected value of X)
E_X = sum(x * p for x, p in zip(x_values, p_values))

# Calculate E(X^2) (expected value of X^2)
E_X2 = sum(x**2 * p for x, p in zip(x_values, p_values))

# Calculate the variance
variance_X = E_X2 - E_X**2

# Calculate the standard deviation
std_dev_X = math.sqrt(variance_X)

# Output the results
print(f"E(X) = {E_X}")
print(f"E(X^2) = {E_X2}")
print(f"Variance = {variance_X}")
print(f"Standard Deviation = {std_dev_X}")
