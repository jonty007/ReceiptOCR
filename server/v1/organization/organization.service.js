import { Organization } from '../../db';

const DEFAULT_ORG_TYPE_ID = 1;

export async function createOrganization(data, user, transaction) {
  try {
    let { name, description, email, phone } = data,
      { user_id } = user;

    if (!name) {
      throw new Error('Validation failed!');
    }

    const organization = await Organization.findOne({
      where: {
        name: data.name
      }
    });

    if (organization) {
      throw new Error('Organization already exists!');
    }
    let org_params = {
        name: name,
        description: description,
        org_type_id: DEFAULT_ORG_TYPE_ID,
        email: email,
        phone: phone,
        created_by: user_id,
        modified_by: user_id
      },
      org_details = await Organization.create(org_params, { transaction });

    return {
      org_details
    };
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function addOrgCode(data, user, transaction) {
  try {
    let { org_id, org_code } = data,
      { user_id } = user;

    await Organization.update(
      {
        org_code: org_code,
        modified_by: user_id
      },
      {
        where: {
          id: org_id
        },
        transaction
      }
    );
  } catch (err) {
    throw new Error(err.message);
  }
}
